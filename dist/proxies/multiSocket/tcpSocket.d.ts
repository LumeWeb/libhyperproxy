/// <reference types="node" />
import { Callback, Duplex } from "streamx";
import { TcpSocketConnectOpts } from "net";
import MultiSocketProxy from "../multiSocket.js";
import { PeerEntity } from "./types.js";
export default class TcpSocket extends Duplex {
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
