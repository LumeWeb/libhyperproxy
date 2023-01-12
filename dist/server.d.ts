/// <reference types="node" />
import EventEmitter from "events";
export default class Server extends EventEmitter {
    address(): {
        address: string;
        family: string;
        port: number;
    };
    close(): Promise<void>;
    getConnections(): Promise<number>;
    listen(...args: any[]): Promise<{
        address: string;
        family: string;
        port: number;
    }>;
    get listening(): boolean;
    set listening(value: boolean);
    get maxConnections(): any;
    set maxConnections(value: any);
    ref(): this;
    unref(): this;
}
