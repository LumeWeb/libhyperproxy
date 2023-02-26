"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const streamx_1 = require("streamx");
const fs_1 = require("fs");
const IPV4 = "IPv4";
const IPV6 = "IPv6";
class Socket extends streamx_1.Duplex {
    _allowHalfOpen;
    remoteAddress;
    remotePort;
    remoteFamily;
    bufferSize;
    remotePublicKey;
    _emulateWebsocket;
    constructor({ allowHalfOpen = false, remoteAddress, remotePort, remotePublicKey, write, emulateWebsocket = false, } = {}) {
        super({ write });
        this._allowHalfOpen = allowHalfOpen;
        this.remoteAddress = remoteAddress;
        this.remotePort = remotePort;
        this.remotePublicKey = remotePublicKey;
        this._emulateWebsocket = emulateWebsocket;
        if (remoteAddress) {
            const type = Socket.isIP(remoteAddress);
            if (!type) {
                throw Error("invalid remoteAddress");
            }
            this.remoteFamily = type === 6 ? IPV6 : IPV4;
        }
        if (this._emulateWebsocket) {
            this.addEventListener("data", (data) => 
            // @ts-ignore
            this.emit("message", new MessageEvent("data", { data })));
        }
    }
    _connecting;
    get connecting() {
        return this._connecting;
    }
    get readyState() {
        if (this._emulateWebsocket) {
            if (this._connecting) {
                return 0;
            }
            else if (this.readable && this.writable) {
                return 1;
            }
            else {
                return 3;
            }
        }
        if (this._connecting) {
            return "opening";
        }
        else if (this.readable && this.writable) {
            return "open";
        }
        else if (this.readable && !this.writable) {
            return "readOnly";
        }
        else if (!this.readable && this.writable) {
            return "writeOnly";
        }
        else {
            return "closed";
        }
    }
    listen() {
        throw new Error("Not supported");
    }
    setTimeout(msecs, callback) {
        throw new Error("Not implemented");
    }
    _onTimeout() {
        // @ts-ignore
        this.emit("timeout");
    }
    setNoDelay(enable) { }
    setKeepAlive(setting, msecs) { }
    address() {
        return {
            address: this.remoteAddress,
            port: this.remotePort,
            family: this.remoteFamily,
        };
    }
    addEventListener = this.addListener;
    on = this.addListener;
    removeEventListener = this.removeListener;
    off = this.removeListener;
    send = fs_1.write;
    static isIP(input) {
        if (Socket.isIPv4(input)) {
            return 4;
        }
        else if (Socket.isIPv6(input)) {
            return 6;
        }
        else {
            return 0;
        }
    }
    static isIPv4(input) {
        return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(input);
    }
    static isIPv6(input) {
        return /^(([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))$/.test(input);
    }
}
exports.default = Socket;
