import Proxy from "./proxy.js";
import Socket from "./socket.js";
import { Buffer } from "buffer";
export type OnOpen = (
  socket: Socket,
  data: any
) =>
  | { connect: boolean }
  | Promise<{ connect: boolean }>
  | Promise<void>
  | void;
export type OnData = (data: any) => void;
export type OnReceive = OnData;
export type OnClose = OnData;
export type OnSend = OnData;

export interface DataSocketOptions {
  onopen?: OnOpen;
  onreceive?: OnReceive;
  onsend?: OnSend;
  onclose?: OnClose;
}

export interface PeerOptions {
  peer: any;
  muxer: any;
}

export interface PeerOptionsWithProxy extends PeerOptions {
  proxy: Proxy;
}

export default class Peer {
  private _proxy: Proxy;
  private _peer: any;
  private _muxer: any;
  private _socket?: Socket;
  private _onopen: OnOpen;
  private _onreceive: OnReceive;
  private _onsend: OnSend;
  private _onclose: OnClose;

  constructor({
    proxy,
    peer,
    muxer,
    onopen,
    onreceive,
    onsend,
    onclose,
  }: PeerOptionsWithProxy & DataSocketOptions) {
    this._proxy = proxy;
    this._peer = peer;
    this._muxer = muxer;
    this._onopen = onopen;
    this._onreceive = onreceive;
    this._onsend = onsend;
    this._onclose = onclose;
  }

  async init() {
    const write = async (data: any, cb: Function) => {
      pipe.send(data);
      await this._onsend?.(data);
      cb();
    };
    const self = this;
    const channel = this._muxer.createChannel({
      protocol: this._proxy.protocol,
      async onopen(m: any) {
        if (!m) {
          m = Buffer.from([]);
        }

        if (m instanceof Uint8Array) {
          m = Buffer.from(m);
        }
        self._socket = new Socket({
          remoteAddress: self._peer.rawStream.remoteHost,
          remotePort: self._peer.rawStream.remotePort,
          remotePublicKey: self._peer.remotePublicKey,
          write,
        });
        self._socket.on("end", () => channel.close());
        let ret = await self._onopen?.(self._socket, m);
        if (!ret || (ret && ret.connect === false)) {
          // @ts-ignore
          self._socket.emit("connect");
        }

        self._socket.emit("data", m);
      },
      async onclose() {
        self._socket?.destroy();
        await self._onclose?.(self._socket);
      },
    });
    const pipe = channel.addMessage({
      async onmessage(m: any) {
        if (m instanceof Uint8Array) {
          m = Buffer.from(m);
        }
        self._socket.emit("data", m);
        await self._onreceive?.(m);
      },
    });

    await channel.open();
  }
}
