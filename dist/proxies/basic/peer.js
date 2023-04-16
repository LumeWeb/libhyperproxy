"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const peer_js_1 = __importDefault(require("../../peer.js"));
const util_js_1 = require("../../util.js");
const socket_js_1 = __importDefault(require("../../socket.js"));
const buffer_1 = require("buffer");
class Peer extends peer_js_1.default {
    _pipe;
    async initSocket() {
        const self = this;
        const raw = await (0, util_js_1.maybeGetAsyncProperty)(self._peer.rawStream);
        this._socket = new socket_js_1.default({
            remoteAddress: raw.remoteHost,
            remotePort: raw.remotePort,
            remotePublicKey: await (0, util_js_1.maybeGetAsyncProperty)(self._peer.remotePublicKey),
            async write(data, cb) {
                self._pipe?.send(data);
                await self._onsend?.(data);
                cb();
            },
            emulateWebsocket: self._emulateWebsocket,
        });
    }
    async handleChannelOnOpen(m) {
        if (!m) {
            m = buffer_1.Buffer.from([]);
        }
        if (m instanceof Uint8Array) {
            m = buffer_1.Buffer.from(m);
        }
        this._socket?.on("end", () => this._channel.close());
        let ret = await this._onopen?.(this._socket, m);
        if (!ret || (ret && ret.connect === false)) {
            // @ts-ignore
            self._socket?.emit("connect");
        }
        this._socket?.emit("data", m);
    }
    async handleChannelOnClose(socket) {
        this._socket?.destroy();
        await this._onclose?.(this._socket);
    }
    async initMessages() {
        const self = this;
        this._pipe = await this._channel.addMessage({
            async onmessage(m) {
                if (m instanceof Uint8Array) {
                    m = buffer_1.Buffer.from(m);
                }
                self._socket.emit("data", m);
                await self._onreceive?.(m);
            },
        });
    }
}
exports.default = Peer;
