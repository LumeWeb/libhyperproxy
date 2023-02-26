import { Duplex, DuplexEvents, Callback } from "streamx";
type AddressFamily = "IPv6" | "IPv4";
interface SocketOptions {
    allowHalfOpen?: boolean;
    remoteAddress?: string;
    remotePort?: number;
    remotePublicKey?: Uint8Array;
    write?: (this: Duplex<any, any, any, any, true, true, DuplexEvents<any, any>>, data: any, cb: Callback) => void;
    emulateWebsocket?: boolean;
}
export default class Socket extends Duplex {
    private _allowHalfOpen;
    remoteAddress: any;
    remotePort: any;
    remoteFamily: AddressFamily;
    bufferSize: any;
    readable: true;
    writable: true;
    remotePublicKey: Uint8Array;
    private _emulateWebsocket;
    addEventListener?: typeof this.addListener;
    removeEventListener?: typeof this.removeListener;
    send?: typeof this.write;
    close?: typeof this.end;
    constructor({ allowHalfOpen, remoteAddress, remotePort, remotePublicKey, write, emulateWebsocket, }?: SocketOptions);
    private _connecting;
    get connecting(): boolean;
    get readyState(): string | number;
    listen(): void;
    setTimeout(msecs: any, callback: any): void;
    _onTimeout(): void;
    setNoDelay(enable: boolean): void;
    setKeepAlive(setting: any, msecs: number): void;
    address(): {
        address: any;
        port: any;
        family: AddressFamily;
    };
    static isIP(input: string): number;
    static isIPv4(input: string): boolean;
    static isIPv6(input: string): boolean;
}
export {};
