/// <reference types="node" />
import { Callback } from "streamx";
import { TcpSocketConnectOpts } from "net";
import MultiSocketProxy from "../multiSocket.js";
import { PeerEntity } from "./types.js";
import BaseSocket from "../../socket.js";
export default class TcpSocket extends BaseSocket {
    private _options;
    private _id;
    private _remoteId;
    private _proxy;
    private _socket?;
    constructor(id: number, remoteId: number, manager: MultiSocketProxy, peer: PeerEntity, options: TcpSocketConnectOpts);
    private _peer;
    get peer(): any;
    _write(data: any, cb: any): void;
    _destroy(cb: Callback): void;
    connect(): void;
    private _getSocketRequest;
}
