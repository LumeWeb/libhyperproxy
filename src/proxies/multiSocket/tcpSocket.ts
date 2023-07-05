import { Callback } from "streamx";
import * as net from "net";
import { Socket, TcpSocketConnectOpts } from "net";
import MultiSocketProxy from "../multiSocket.js";
import { PeerEntity, SocketRequest, WriteSocketRequest } from "./types.js";
import BaseSocket from "../../socket.js";

export default class TcpSocket extends BaseSocket {
  private _options;
  private _id: number;
  private _remoteId: number;
  private _proxy: MultiSocketProxy;

  private _socket?: Socket;

  constructor(
    id: number,
    remoteId: number,
    manager: MultiSocketProxy,
    peer: PeerEntity,
    options: TcpSocketConnectOpts,
  ) {
    super();
    this._remoteId = remoteId;
    this._proxy = manager;
    this._id = id;
    this._peer = peer;
    this._options = options;

    this._proxy.sockets.set(this._id, this);
    this._proxy.socketMap.set(this._id, this._remoteId);
  }

  private _peer;

  get peer() {
    return this._peer;
  }

  public _write(data: any, cb: any): void {
    this._peer.messages.writeSocket?.send({
      ...this._getSocketRequest(),
      data,
    } as WriteSocketRequest);
    cb();
  }

  public _destroy(cb: Callback) {
    this._proxy.sockets.delete(this._id);
    this._proxy.socketMap.delete(this._id);
    this._peer.messages.closeSocket?.send(this._getSocketRequest());
  }

  public connect() {
    this.on("error", (err: Error) => {
      this._peer.messages.errorSocket?.send({
        ...this._getSocketRequest(),
        err,
      });
    });

    // @ts-ignore
    this.on("timeout", () => {
      this._peer.messages.timeoutSocket?.send(this._getSocketRequest());
    });
    // @ts-ignore
    this.on("connect", () => {
      this._peer.messages.openSocket?.send(this._getSocketRequest());
    });

    this._socket = net.connect(this._options);
    ["timeout", "error", "connect", "end", "destroy", "close"].forEach(
      (event) => {
        this._socket?.on(event, (...args: any) =>
          this.emit(event as any, ...args),
        );
      },
    );

    this._socket.pipe(this as any);
    this.pipe(this._socket);
  }

  private _getSocketRequest(): SocketRequest {
    return {
      id: this._id,
      remoteId: this._remoteId,
    };
  }
}
