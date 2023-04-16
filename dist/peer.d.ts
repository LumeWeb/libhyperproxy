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
export type OnChannel = (peer: Peer, channel: any) => void;
export type OnOpenBound = (socket: Socket, data: any) => {
    connect: boolean;
} | Promise<{
    connect: boolean;
}> | Promise<void> | void;
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
    constructor({ proxy, peer, muxer, onopen, onreceive, onsend, onclose, onchannel, emulateWebsocket, }: PeerOptionsWithProxy & DataSocketOptions);
    protected _socket?: Socket;
    get socket(): Socket;
    protected _channel?: any;
    get channel(): any;
    protected abstract initSocket(): any;
    protected abstract handleChannelOnOpen(m: any): Promise<void>;
    protected abstract handleChannelOnClose(socket: Socket): Promise<void>;
    protected initChannel(): Promise<void>;
    init(): Promise<void>;
    protected initMessages(): Promise<void>;
}
