/// <reference types="node" />
import { Callback } from "streamx";
import { TcpSocketConnectOpts } from "net";
import MultiSocketProxy from "../multiSocket.js";
import { PeerEntity } from "./types.js";
import Socket, { SocketOptions } from "../../socket.js";
export default class DummySocket extends Socket {
    private _options;
    private _id;
    private _proxy;
    private _connectTimeout?;
    constructor(id: number, manager: MultiSocketProxy, peer: PeerEntity, connectOptions: TcpSocketConnectOpts, socketOptions: SocketOptions);
    private _remoteId;
    set remoteId(value: number);
    private _peer;
    get peer(): any;
    _write(data: any, cb: any): Promise<void>;
    _destroy(cb: Callback): Promise<void>;
    connect(): Promise<void>;
    setTimeout(ms: number, cb: Function): void;
}
