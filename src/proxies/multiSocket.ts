import Proxy, { ProxyOptions } from "../proxy.js";
import TcpSocket from "./multiSocket/tcpSocket.js";
import { json, raw, uint } from "compact-encoding";
import { deserializeError } from "serialize-error";
import b4a from "b4a";
import type { TcpSocketConnectOpts } from "net";
import { DataSocketOptions, PeerOptions } from "../peer.js";
import { roundRobinFactory, idFactory } from "../util.js";
import {
  CloseSocketRequest,
  ErrorSocketRequest,
  PeerEntity,
  SocketRequest,
  WriteSocketRequest,
} from "./multiSocket/types.js";
import DummySocket from "./multiSocket/dummySocket.js";
import Peer from "./multiSocket/peer.js";

export interface MultiSocketProxyOptions extends ProxyOptions {
  socketClass?: any;
  server: boolean;
  allowedPorts?: number[];
}

const socketEncoding = {
  preencode(state: any, m: SocketRequest) {
    uint.preencode(state, m.id);
    uint.preencode(state, m.remoteId);
  },
  encode(state: any, m: SocketRequest) {
    uint.encode(state, m.id);
    uint.encode(state, m.remoteId);
  },
  decode(state: any, m: any): SocketRequest {
    return {
      remoteId: uint.decode(state, m),
      id: uint.decode(state, m),
    };
  },
};

const writeSocketEncoding = {
  preencode(state: any, m: WriteSocketRequest) {
    socketEncoding.preencode(state, m);
    raw.preencode(state, m.data);
  },
  encode(state: any, m: WriteSocketRequest) {
    socketEncoding.encode(state, m);
    raw.encode(state, m.data);
  },
  decode(state: any, m: any): WriteSocketRequest {
    const socket = socketEncoding.decode(state, m);
    return {
      ...socket,
      data: raw.decode(state, m),
    };
  },
};

const errorSocketEncoding = {
  decode(state: any, m: any): ErrorSocketRequest {
    const socket = socketEncoding.decode(state, m);
    return {
      ...socket,
      err: deserializeError(json.decode(state, m)),
    };
  },
};

const nextSocketId = idFactory(1);

export default class MultiSocketProxy extends Proxy {
  handlePeer({ peer, muxer, ...options }: DataSocketOptions & PeerOptions) {
    new Peer({
      ...this.socketOptions,
      proxy: this,
      peer,
      muxer,
      ...options,
    });
  }
  private socketClass: any;
  private _peers: Map<string, PeerEntity> = new Map<string, PeerEntity>();
  private _nextPeer = roundRobinFactory(this._peers);
  private _server = false;
  private _allowedPorts = [];

  constructor(options: MultiSocketProxyOptions) {
    super(options);
    if (options.socketClass) {
      this.socketClass = options.socketClass;
    } else {
      if (options.server) {
        this.socketClass = TcpSocket;
      } else {
        this.socketClass = DummySocket;
      }
    }
    if (options.server) {
      this._server = true;
    }
  }

  private _socketMap = new Map<number, number>();

  get socketMap(): Map<number, number> {
    return this._socketMap;
  }

  private _sockets = new Map<number, typeof this.socketClass>();

  get sockets(): Map<number, any> {
    return this._sockets;
  }

  handleNewPeerChannel(peer: Peer, channel: any) {
    this.update(peer.socket.remotePublicKey, { peer });

    this._registerOpenSocketMessage(peer, channel);
    this._registerWriteSocketMessage(peer, channel);
    this._registerCloseSocketMessage(peer, channel);
    this._registerTimeoutSocketMessage(peer, channel);
    this._registerErrorSocketMessage(peer, channel);
  }

  async handleClosePeer(peer: Peer) {
    for (const item of this._sockets) {
      if (item[1].peer.peer === peer) {
        item[1].end();
      }
    }

    const pubkey = this._toString(peer.socket.remotePublicKey);

    if (this._peers.has(pubkey)) {
      this._peers.delete(pubkey);
    }
  }

  public get(pubkey: Uint8Array): PeerEntity | undefined {
    if (this._peers.has(this._toString(pubkey))) {
      return this._peers.get(this._toString(pubkey)) as PeerEntity;
    }

    return undefined;
  }

  public update(pubkey: Uint8Array, data: Partial<PeerEntity>): void {
    const peer = this.get(pubkey) ?? ({} as PeerEntity);

    this._peers.set(this._toString(pubkey), {
      ...peer,
      ...data,
      ...{
        messages: {
          ...peer?.messages,
          ...data?.messages,
        },
      },
    } as PeerEntity);
  }

  public async createSocket(
    options: TcpSocketConnectOpts
  ): Promise<typeof this.socketClass> {
    if (!this._peers.size) {
      throw new Error("no peers found");
    }

    const peer = this._nextPeer();
    const socketId = nextSocketId();
    const socket = new this.socketClass(socketId, this, peer, options);
    this._sockets.set(socketId, socket);

    return socket;
  }

  private _registerOpenSocketMessage(peer: Peer, channel: any) {
    const self = this;
    const message = channel.addMessage({
      encoding: {
        preencode: json.preencode,
        encode: json.encode,
        decode: this._server ? json.encode : socketEncoding.decode,
      },
      async onmessage(m: SocketRequest | TcpSocketConnectOpts) {
        if (
          self._allowedPorts.length &&
          !self._allowedPorts.includes((m as TcpSocketConnectOpts).port)
        ) {
          self.get(peer.socket.remotePublicKey).messages.errorSocket.send({
            id: (m as SocketRequest).id,
            err: new Error(
              `port ${(m as TcpSocketConnectOpts).port} not allowed`
            ),
          });
          return;
        }

        m = m as SocketRequest;

        if (self._server) {
          new self.socketClass(
            nextSocketId(),
            m,
            self,
            self.get(peer.socket.remotePublicKey) as PeerEntity,
            m
          ).connect();
          return;
        }

        const socket = self._sockets.get(m.id);
        if (socket) {
          socket.remoteId = m.remoteId;
          // @ts-ignore
          socket.emit("connect");
        }
      },
    });
    this.update(peer.socket.remotePublicKey, {
      messages: { openSocket: message },
    });
  }

  private _registerWriteSocketMessage(peer: Peer, channel: any) {
    const self = this;
    const message = channel.addMessage({
      encoding: writeSocketEncoding,
      onmessage(m: WriteSocketRequest) {
        self._sockets.get(m.id)?.push(m.data);
      },
    });
    this.update(peer.socket.remotePublicKey, {
      messages: { writeSocket: message },
    });
  }

  private _registerCloseSocketMessage(peer: Peer, channel: any) {
    const self = this;
    const message = channel.addMessage({
      encoding: socketEncoding,
      onmessage(m: CloseSocketRequest) {
        self._sockets.get(m.id)?.end();
      },
    });
    this.update(peer.socket.remotePublicKey, {
      messages: { closeSocket: message },
    });
  }

  private _registerTimeoutSocketMessage(peer: Peer, channel: any) {
    const self = this;
    const message = channel.addMessage({
      encoding: socketEncoding,
      onmessage(m: SocketRequest) {
        // @ts-ignore
        self._sockets.get(m.id)?.emit("timeout");
      },
    });
    this.update(peer.socket.remotePublicKey, {
      messages: { timeoutSocket: message },
    });
  }

  private _registerErrorSocketMessage(peer: Peer, channel: any) {
    const self = this;
    const message = channel.addMessage({
      encoding: errorSocketEncoding,
      onmessage(m: ErrorSocketRequest) {
        // @ts-ignore
        self._sockets.get(m.id)?.emit("error", m.err);
      },
    });
    this.update(peer.socket.remotePublicKey, {
      messages: { errorSocket: message },
    });
  }

  private _toString(pubkey: Uint8Array) {
    return b4a.from(pubkey).toString("hex");
  }
}
