"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_js_1 = __importDefault(require("./socket.js"));
class Peer {
    _proxy;
    _peer;
    _muxer;
    _socket;
    _onopen;
    _onreceive;
    _onsend;
    _onclose;
    constructor({ proxy, peer, muxer, onopen, onreceive, onsend, onclose, }) {
        this._proxy = proxy;
        this._peer = peer;
        this._muxer = muxer;
        this._onopen = onopen;
        this._onreceive = onreceive;
        this._onsend = onsend;
        this._onclose = onclose;
    }
    async init() {
        const write = async (data, cb) => {
            pipe.send(data);
            await this._onsend?.(data);
            cb();
        };
        const self = this;
        const channel = this._muxer.createChannel({
            protocol: this._proxy.protocol,
            async onopen(m) {
                if (!m) {
                    m = Buffer.from([]);
                }
                self._socket = new socket_js_1.default({
                    remoteAddress: self._peer.rawStream.remoteHost,
                    remotePort: self._peer.rawStream.remotePort,
                    write,
                });
                self._socket.on("end", () => channel.close());
                let ret = await self._onopen?.(self._socket, m);
                if (!ret || (ret && ret.connect === false)) {
                    // @ts-ignore
                    self._socket.emit("connect");
                }
                self._socket.emit("data", m);
            },
            async onclose() {
                self._socket?.end();
                await self._onclose?.(self._socket);
            },
        });
        const pipe = channel.addMessage({
            async onmessage(m) {
                self._socket.emit("data", m);
                await self._onreceive?.(m);
            },
        });
        await channel.open();
    }
}
exports.default = Peer;
