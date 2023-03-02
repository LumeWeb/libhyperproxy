import Proxy from "./proxy.js";
import Socket from "./socket.js";
export type OnOpen = (peer: Peer, socket: Socket, data: any) => {
    connect: boolean;
} | Promise<{
    connect: boolean;
}> | Promise<void> | void;
export type OnData = (peer: Peer, data: any) => void;
export type OnReceive = OnData;
export type OnClose = OnData;
export type OnSend = OnData;
export type OnOpenBound = (socket: Socket, data: any) => {
    connect: boolean;
} | Promise<{
    connect: boolean;
}> | Promise<void> | void;
export type OnDataBound = (data: any) => void;
export type OnReceiveBound = OnDataBound;
export type OnCloseBound = OnDataBound;
export type OnSendBound = OnDataBound;
export interface DataSocketOptions {
    onopen?: OnOpen;
    onreceive?: OnReceive;
    onsend?: OnSend;
    onclose?: OnClose;
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
    private _proxy;
    private _peer;
    private _muxer;
    private _socket?;
    private _onopen;
    private _onreceive;
    private _onsend;
    private _onclose;
    private _emulateWebsocket;
    private _channel?;
    constructor({ proxy, peer, muxer, onopen, onreceive, onsend, onclose, emulateWebsocket, }: PeerOptionsWithProxy & DataSocketOptions);
    init(): Promise<void>;
}
