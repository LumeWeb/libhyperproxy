/// <reference types="node" />
import Proxy, { ProxyOptions } from "../proxy.js";
import type { TcpSocketConnectOpts } from "net";
import { DataSocketOptions, PeerOptions } from "../peer.js";
import { PeerEntity } from "./multiSocket/types.js";
import Peer from "./multiSocket/peer.js";
export interface MultiSocketProxyOptions extends ProxyOptions {
    socketClass?: any;
    server: boolean;
    allowedPorts?: number[];
}
export default class MultiSocketProxy extends Proxy {
    handlePeer({ peer, muxer, ...options }: DataSocketOptions & PeerOptions): Promise<void>;
    private socketClass;
    private _peers;
    private _nextPeer;
    private _server;
    private _allowedPorts;
    constructor(options: MultiSocketProxyOptions);
    private _socketMap;
    get socketMap(): Map<number, number>;
    private _sockets;
    get sockets(): Map<number, any>;
    handleNewPeerChannel(peer: Peer): Promise<void>;
    handleClosePeer(peer: Peer): Promise<void>;
    get(pubkey: Uint8Array): PeerEntity | undefined;
    update(pubkey: Uint8Array, data: Partial<PeerEntity>): void;
    createSocket(options: TcpSocketConnectOpts): typeof this.socketClass;
    private _registerOpenSocketMessage;
    private _registerWriteSocketMessage;
    private _registerCloseSocketMessage;
    private _registerTimeoutSocketMessage;
    private _registerErrorSocketMessage;
    private _toString;
    private _getPublicKey;
}
