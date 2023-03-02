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
    _socket;
    _onopen;
    _onreceive;
    _onsend;
    _onclose;
    _emulateWebsocket;
    constructor({ proxy, peer, muxer, onopen, onreceive, onsend, onclose, emulateWebsocket = false, }) {
        this._proxy = proxy;
        this._peer = peer;
        this._muxer = muxer;
        this._onopen = onopen?.bind(undefined, this);
        this._onreceive = onreceive?.bind(undefined, this);
        this._onsend = onsend?.bind(undefined, this);
        this._onclose = onclose?.bind(undefined, this);
        this._emulateWebsocket = emulateWebsocket;
    }
    _channel;
    get channel() {
        return this._channel;
    }
    async init() {
        const write = async (data, cb) => {
            pipe.send(data);
            await this._onsend?.(data);
            cb();
        };
        const self = this;
        this._channel = this._muxer.createChannel({
            protocol: this._proxy.protocol,
            async onopen(m) {
                if (!m) {
                    m = buffer_1.Buffer.from([]);
                }
                if (m instanceof Uint8Array) {
                    m = buffer_1.Buffer.from(m);
                }
                self._socket = new socket_js_1.default({
                    remoteAddress: self._peer.rawStream.remoteHost,
                    remotePort: self._peer.rawStream.remotePort,
                    remotePublicKey: self._peer.remotePublicKey,
                    write,
                    emulateWebsocket: self._emulateWebsocket,
                });
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
        const pipe = this._channel.addMessage({
            async onmessage(m) {
                if (m instanceof Uint8Array) {
                    m = buffer_1.Buffer.from(m);
                }
                self._socket.emit("data", m);
                await self._onreceive?.(m);
            },
        });
        await this._channel.open();
    }
}
exports.default = Peer;
