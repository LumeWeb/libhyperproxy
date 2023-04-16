import Proxy from "./proxy.js";
import Socket from "./socket.js";
import { Buffer } from "buffer";
import { maybeGetAsyncProperty } from "./util.js";
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

export default abstract class Peer {
  protected _proxy: Proxy;
  protected _peer: any;
  protected _muxer: any;
  protected _onopen: OnOpenBound;
  protected _onreceive: OnReceiveBound;
  protected _onsend: OnSendBound;
  protected _onclose: OnCloseBound;
  protected _onchannel: OnChannelBound;
  protected _emulateWebsocket: boolean;

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

  protected _socket?: Socket;

  get socket(): Socket {
    return this._socket;
  }

  protected _channel?: any;

  get channel(): any {
    return this._channel;
  }

  protected abstract initSocket();

  protected abstract handleChannelOnOpen(m: any): Promise<void>;
  protected abstract handleChannelOnClose(socket: Socket): Promise<void>;

  protected async initChannel() {
    const self = this;

    this._channel = await this._muxer.createChannel({
      protocol: this._proxy.protocol,
      onopen: async (m: any) => {
        await this.handleChannelOnOpen(m);
        // @ts-ignore
        await this._onopen?.(this._channel);
      },
      onclose: async (socket: Socket) => {
        await this.handleChannelOnClose(socket);
        // @ts-ignore
        await this._onclose?.();
      },
    });

    await this.initMessages();

    await this._onchannel?.(this._channel);
    await this._channel.open();
    this._proxy.emit("peerChannelOpen", this);
  }

  async init() {
    await this.initSocket();
    await this.initChannel();
  }

  protected async initMessages() {}
}
