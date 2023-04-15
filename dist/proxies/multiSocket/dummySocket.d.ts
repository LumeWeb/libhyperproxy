/// <reference types="node" />
import { Callback, Duplex } from "streamx";
import { TcpSocketConnectOpts } from "net";
import MultiSocketProxy from "../multiSocket.js";
import { PeerEntity } from "./types.js";
export default class DummySocket extends Duplex {
    private _options;
    private _id;
    private _proxy;
    private _connectTimeout?;
    constructor(id: number, manager: MultiSocketProxy, peer: PeerEntity, options: TcpSocketConnectOpts);
    private _remoteId;
    set remoteId(value: number);
    private _peer;
    get peer(): any;
    _write(data: any, cb: any): Promise<void>;
    _destroy(cb: Callback): Promise<void>;
    connect(): Promise<void>;
    setTimeout(ms: number, cb: Function): void;
}
