import { DataSocketOptions, PeerOptions } from "./peer.js";
export interface ProxyOptions extends DataSocketOptions {
    swarm: any;
    protocol: string;
    listen?: boolean;
    autostart?: boolean;
}
export default abstract class Proxy {
    protected _listen: any;
    protected _autostart: boolean;
    constructor({ swarm, protocol, onopen, onreceive, onsend, onclose, onchannel, listen, autostart, emulateWebsocket, }: ProxyOptions);
    protected _socketOptions: DataSocketOptions;
    get socketOptions(): DataSocketOptions;
    private _swarm;
    get swarm(): any;
    private _protocol;
    get protocol(): string;
    protected abstract handlePeer({ peer, muxer, ...options }: DataSocketOptions & PeerOptions): any;
    protected _init(): void;
    private init;
    private _handleConnection;
}
