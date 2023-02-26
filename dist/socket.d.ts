/// <reference types="node" />
import { Duplex, DuplexEvents, Callback } from "streamx";
import { write } from "fs";
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
    constructor({ allowHalfOpen, remoteAddress, remotePort, remotePublicKey, write, emulateWebsocket, }?: SocketOptions);
    private _connecting;
    get connecting(): boolean;
    get readyState(): string;
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
    addEventListener: <TEvent extends "data" | "end" | "finish" | "pipe" | "readable" | "drain" | keyof import("streamx").StreamEvents | "piping">(event: TEvent, listener: TEvent extends "data" | "end" | "finish" | "pipe" | "readable" | "drain" | keyof import("streamx").StreamEvents | "piping" ? DuplexEvents<any, any>[TEvent] : (...args: any[]) => void) => this;
    on: <TEvent extends "data" | "end" | "finish" | "pipe" | "readable" | "drain" | keyof import("streamx").StreamEvents | "piping">(event: TEvent, listener: TEvent extends "data" | "end" | "finish" | "pipe" | "readable" | "drain" | keyof import("streamx").StreamEvents | "piping" ? DuplexEvents<any, any>[TEvent] : (...args: any[]) => void) => this;
    removeEventListener: <TEvent extends "data" | "end" | "finish" | "pipe" | "readable" | "drain" | keyof import("streamx").StreamEvents | "piping">(event: TEvent, listener: TEvent extends "data" | "end" | "finish" | "pipe" | "readable" | "drain" | keyof import("streamx").StreamEvents | "piping" ? DuplexEvents<any, any>[TEvent] : (...args: any[]) => void) => this;
    off: <TEvent extends "data" | "end" | "finish" | "pipe" | "readable" | "drain" | keyof import("streamx").StreamEvents | "piping">(event: TEvent, listener: TEvent extends "data" | "end" | "finish" | "pipe" | "readable" | "drain" | keyof import("streamx").StreamEvents | "piping" ? DuplexEvents<any, any>[TEvent] : (...args: any[]) => void) => this;
    send: typeof write;
    static isIP(input: string): number;
    static isIPv4(input: string): boolean;
    static isIPv6(input: string): boolean;
}
export {};
