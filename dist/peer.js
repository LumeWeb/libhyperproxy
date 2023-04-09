"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_js_1 = __importDefault(require("./socket.js"));
const buffer_1 = require("buffer");
class Peer {
    _proxy;
    _peer;
    _muxer;
    _onopen;
    _onreceive;
    _onsend;
    _onclose;
    _onchannel;
    _emulateWebsocket;
    _createDefaultMessage;
    constructor({ proxy, peer, muxer, onopen, onreceive, onsend, onclose, onchannel, emulateWebsocket = false, createDefaultMessage = true, }) {
        this._proxy = proxy;
        this._peer = peer;
        this._muxer = muxer;
        this._onopen = onopen?.bind(undefined, this);
        this._onreceive = onreceive?.bind(undefined, this);
        this._onsend = onsend?.bind(undefined, this);
        this._onclose = onclose?.bind(undefined, this);
        this._onchannel = onchannel?.bind(undefined, this);
        this._emulateWebsocket = emulateWebsocket;
        this._createDefaultMessage = createDefaultMessage;
    }
    _socket;
    get socket() {
        return this._socket;
    }
    _channel;
    get channel() {
        return this._channel;
    }
    async init() {
        const self = this;
        let pipe;
        const raw = await maybeGetAsyncProperty(self._peer.rawStream);
        this._socket = new socket_js_1.default({
            remoteAddress: raw.remoteHost,
            remotePort: raw.remotePort,
            remotePublicKey: self._peer.remotePublicKey,
            async write(data, cb) {
                if (pipe) {
                    pipe.send(data);
                }
                await self._onsend?.(data);
                cb();
            },
            emulateWebsocket: self._emulateWebsocket,
        });
        this._channel = await this._muxer.createChannel({
            protocol: this._proxy.protocol,
            async onopen(m) {
                if (!m) {
                    m = buffer_1.Buffer.from([]);
                }
                if (m instanceof Uint8Array) {
                    m = buffer_1.Buffer.from(m);
                }
                self._socket.on("end", () => this._channel.close());
                let ret = await self._onopen?.(self._socket, m);
                if (!ret || (ret && ret.connect === false)) {
                    // @ts-ignore
                    self._socket.emit("connect");
                }
                self._socket.emit("data", m);
            },
            async onclose() {
                self._socket?.destroy();
                await self._onclose?.(self._socket);
            },
        });
        if (this._createDefaultMessage) {
            pipe = await this._channel.addMessage({
                async onmessage(m) {
                    if (m instanceof Uint8Array) {
                        m = buffer_1.Buffer.from(m);
                    }
                    self._socket.emit("data", m);
                    await self._onreceive?.(m);
                },
            });
        }
        await this._onchannel?.(this._channel);
        await this._channel.open();
    }
}
exports.default = Peer;
async function maybeGetAsyncProperty(object) {
    if (typeof object === "function") {
        object = object();
    }
    if (isPromise(object)) {
        object = await object;
    }
    return object;
}
function isPromise(obj) {
    return (!!obj &&
        (typeof obj === "object" || typeof obj === "function") &&
        typeof obj.then === "function");
}
