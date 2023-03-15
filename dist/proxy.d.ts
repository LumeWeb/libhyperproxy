import { PeerOptions, DataSocketOptions } from "./peer.js";
export interface ProxyOptions extends DataSocketOptions {
    swarm: any;
    protocol: string;
    listen?: boolean;
    autostart?: boolean;
}
export default class Proxy {
    private _listen;
    private _socketOptions;
    private _autostart;
    constructor({ swarm, protocol, onopen, onreceive, onsend, onclose, onchannel, listen, autostart, emulateWebsocket, createDefaultMessage, }: ProxyOptions);
    private _swarm;
    get swarm(): any;
    private _protocol;
    get protocol(): string;
    handlePeer({ peer, muxer, ...options }: DataSocketOptions & PeerOptions): void;
    protected _init(): void;
    private init;
    private _handleConnection;
}
