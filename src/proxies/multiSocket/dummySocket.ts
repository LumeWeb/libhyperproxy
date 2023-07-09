import { Callback } from "streamx";
import { TcpSocketConnectOpts } from "net";
import { clearTimeout, setTimeout } from "timers";
import MultiSocketProxy from "../multiSocket.js";
import { PeerEntity, SocketRequest, WriteSocketRequest } from "./types.js";
import { maybeGetAsyncProperty } from "#util.js";
import Socket, { SocketOptions } from "#socket.js";

export default class DummySocket extends Socket {
  private _options: TcpSocketConnectOpts;
  private _id: number;
  private _proxy: MultiSocketProxy;

  private _connectTimeout?: number;

  constructor(
    id: number,
    manager: MultiSocketProxy,
    peer: PeerEntity,
    connectOptions: TcpSocketConnectOpts,
    socketOptions: SocketOptions,
  ) {
    super(socketOptions);
    this._id = id;
    this._proxy = manager;
    this._peer = peer;
    this._options = connectOptions;

    // @ts-ignore
    this.on("timeout", () => {
      if (this._connectTimeout) {
        clearTimeout(this._connectTimeout);
      }
    });
  }

  private _remoteId = 0;

  set remoteId(value: number) {
    this._remoteId = value;
    this._proxy.socketMap.set(this._id, value);
  }

  private _peer;

  get peer() {
    return this._peer;
  }

  public async _write(data: any, cb: any): Promise<void> {
    (await maybeGetAsyncProperty(this._peer.messages.writeSocket))?.send({
      id: this._id,
      remoteId: this._remoteId,
      data,
    } as WriteSocketRequest);
    cb();
  }

  public async _destroy(cb: Callback) {
    (await maybeGetAsyncProperty(this._peer.messages.closeSocket))?.send({
      id: this._id,
      remoteId: this._remoteId,
    } as SocketRequest);
    this._proxy.socketMap.delete(this._id);
    this._proxy.sockets.delete(this._id);
  }

  public async connect() {
    (await maybeGetAsyncProperty(this._peer.messages.openSocket))?.send({
      ...this._options,
      id: this._id,
    });
  }

  public setTimeout(ms: number, cb: Function) {
    if (this._connectTimeout) {
      clearTimeout(this._connectTimeout);
    }

    this._connectTimeout = setTimeout(() => {
      cb && cb();
    }, ms) as any;
  }
}
