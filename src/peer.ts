import Proxy from "./proxy.js";
import Socket from "./socket.js";
import { Buffer } from "buffer";
export type OnOpen = (
  peer: Peer,
  socket: Socket,
  data: any
) =>
  | { connect: boolean }
  | Promise<{ connect: boolean }>
  | Promise<void>
  | void;
export type OnData = (peer: Peer, data: any) => void;
export type OnReceive = OnData;
export type OnClose = OnData;
export type OnSend = OnData;
export type OnChannel = (peer: Peer, channel: any) => void;

export type OnOpenBound = (
  socket: Socket,
  data: any
) =>
  | { connect: boolean }
  | Promise<{ connect: boolean }>
  | Promise<void>
  | void;
export type OnDataBound = (data: any) => void;
export type OnReceiveBound = OnDataBound;
export type OnCloseBound = OnDataBound;
export type OnSendBound = OnDataBound;

export type OnChannelBound = (channel: any) => void;

export interface DataSocketOptions {
  onopen?: OnOpen;
  onreceive?: OnReceive;
  onsend?: OnSend;
  onclose?: OnClose;
  onchannel?: OnChannel;
  emulateWebsocket?: boolean;
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
  private _onopen: OnOpenBound;
  private _onreceive: OnReceiveBound;
  private _onsend: OnSendBound;
  private _onclose: OnCloseBound;
  private _onchannel: OnChannelBound;
  private _emulateWebsocket: boolean;

  constructor({
    proxy,
    peer,
    muxer,
    onopen,
    onreceive,
    onsend,
    onclose,
    onchannel,
    emulateWebsocket = false,
  }: PeerOptionsWithProxy & DataSocketOptions) {
    this._proxy = proxy;
    this._peer = peer;
    this._muxer = muxer;
    this._onopen = onopen?.bind(undefined, this);
    this._onreceive = onreceive?.bind(undefined, this);
    this._onsend = onsend?.bind(undefined, this);
    this._onclose = onclose?.bind(undefined, this);
    this._onchannel = onchannel?.bind(undefined, this);
    this._emulateWebsocket = emulateWebsocket;
  }

  private _socket?: Socket;

  get socket(): Socket {
    return this._socket;
  }

  private _channel?: any;

  get channel(): any {
    return this._channel;
  }

  async init() {
    const self = this;
    this._socket = new Socket({
      remoteAddress: self._peer.rawStream.remoteHost,
      remotePort: self._peer.rawStream.remotePort,
      remotePublicKey: self._peer.remotePublicKey,
      async write(data: any, cb: Function) {
        pipe.send(data);
        await self._onsend?.(data);
        cb();
      },
      emulateWebsocket: self._emulateWebsocket,
    });

    this._channel = this._muxer.createChannel({
      protocol: this._proxy.protocol,
      async onopen(m: any) {
        if (!m) {
          m = Buffer.from([]);
        }

        if (m instanceof Uint8Array) {
          m = Buffer.from(m);
        }

        self._socket.on("end", () => this._channel.close());
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
    const pipe = this._channel.addMessage({
      async onmessage(m: any) {
        if (m instanceof Uint8Array) {
          m = Buffer.from(m);
        }
        self._socket.emit("data", m);
        await self._onreceive?.(m);
      },
    });

    await this._onchannel?.(this._channel);
    await this._channel.open();
  }
}
