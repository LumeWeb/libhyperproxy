"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const proxy_js_1 = __importDefault(require("../proxy.js"));
const tcpSocket_js_1 = __importDefault(require("./multiSocket/tcpSocket.js"));
const compact_encoding_1 = require("compact-encoding");
const serialize_error_1 = require("serialize-error");
const b4a_1 = __importDefault(require("b4a"));
const util_js_1 = require("../util.js");
const dummySocket_js_1 = __importDefault(require("./multiSocket/dummySocket.js"));
const peer_js_1 = __importDefault(require("./multiSocket/peer.js"));
const socketEncoding = {
    preencode(state, m) {
        compact_encoding_1.uint.preencode(state, m.id);
        compact_encoding_1.uint.preencode(state, m.remoteId);
    },
    encode(state, m) {
        compact_encoding_1.uint.encode(state, m.id);
        compact_encoding_1.uint.encode(state, m.remoteId);
    },
    decode(state, m) {
        return {
            remoteId: compact_encoding_1.uint.decode(state, m),
            id: compact_encoding_1.uint.decode(state, m),
        };
    },
};
const writeSocketEncoding = {
    preencode(state, m) {
        socketEncoding.preencode(state, m);
        compact_encoding_1.raw.preencode(state, m.data);
    },
    encode(state, m) {
        socketEncoding.encode(state, m);
        compact_encoding_1.raw.encode(state, m.data);
    },
    decode(state, m) {
        const socket = socketEncoding.decode(state, m);
        return {
            ...socket,
            data: compact_encoding_1.raw.decode(state, m),
        };
    },
};
const errorSocketEncoding = {
    preencode(state, m) {
        socketEncoding.preencode(state, m);
        compact_encoding_1.json.preencode(state, (0, serialize_error_1.serializeError)(m.err));
    },
    encode(state, m) {
        socketEncoding.encode(state, m);
        compact_encoding_1.json.encode(state, (0, serialize_error_1.serializeError)(m.err));
    },
    decode(state, m) {
        const socket = socketEncoding.decode(state, m);
        return {
            ...socket,
            err: (0, serialize_error_1.deserializeError)(compact_encoding_1.json.decode(state, m)),
        };
    },
};
const nextSocketId = (0, util_js_1.idFactory)(1);
class MultiSocketProxy extends proxy_js_1.default {
    async handlePeer({ peer, muxer, ...options }) {
        const conn = new peer_js_1.default({
            ...this.socketOptions,
            proxy: this,
            peer,
            muxer,
            ...options,
        });
        await conn.init();
        this.emit("peer", conn);
    }
    socketClass;
    _peers = new Map();
    _nextPeer;
    _server = false;
    _allowedPorts = [];
    constructor(options) {
        super(options);
        if (options.socketClass) {
            this.socketClass = options.socketClass;
        }
        else {
            if (options.server) {
                this.socketClass = tcpSocket_js_1.default;
            }
            else {
                this.socketClass = dummySocket_js_1.default;
            }
        }
        if (options.server) {
            this._server = true;
        }
        this._nextPeer = (0, util_js_1.roundRobinFactory)(this._peers);
    }
    _socketMap = new Map();
    get socketMap() {
        return this._socketMap;
    }
    _sockets = new Map();
    get sockets() {
        return this._sockets;
    }
    async handleNewPeerChannel(peer) {
        this.update(await this._getPublicKey(peer), {
            peer,
        });
        await this._registerOpenSocketMessage(peer);
        await this._registerWriteSocketMessage(peer);
        await this._registerCloseSocketMessage(peer);
        await this._registerTimeoutSocketMessage(peer);
        await this._registerErrorSocketMessage(peer);
    }
    async handleClosePeer(peer) {
        for (const item of this._sockets) {
            if (item[1].peer.peer === peer) {
                item[1].end();
            }
        }
        const pubkey = this._toString(await this._getPublicKey(peer));
        if (this._peers.has(pubkey)) {
            this._peers.delete(pubkey);
        }
    }
    get(pubkey) {
        if (this._peers.has(this._toString(pubkey))) {
            return this._peers.get(this._toString(pubkey));
        }
        return undefined;
    }
    update(pubkey, data) {
        const peer = this.get(pubkey) ?? {};
        this._peers.set(this._toString(pubkey), {
            ...peer,
            ...data,
            ...{
                messages: {
                    ...peer?.messages,
                    ...data?.messages,
                },
            },
        });
    }
    createSocket(options) {
        if (!this._peers.size) {
            throw new Error("no peers found");
        }
        const peer = this._nextPeer();
        const socketId = nextSocketId();
        const socket = new this.socketClass(socketId, this, peer, options);
        this._sockets.set(socketId, socket);
        return socket;
    }
    async _registerOpenSocketMessage(peer) {
        const self = this;
        const message = await peer.channel.addMessage({
            encoding: {
                preencode: this._server ? socketEncoding.preencode : compact_encoding_1.json.preencode,
                encode: this._server ? socketEncoding.encode : compact_encoding_1.json.encode,
                decode: this._server ? compact_encoding_1.json.decode : socketEncoding.decode,
            },
            async onmessage(m) {
                if (self._server) {
                    if (self._allowedPorts.length &&
                        !self._allowedPorts.includes(m.port)) {
                        self.get(await self._getPublicKey(peer)).messages.errorSocket.send({
                            id: m.id,
                            err: new Error(`port ${m.port} not allowed`),
                        });
                        return;
                    }
                }
                m = m;
                if (self._server) {
                    new self.socketClass(nextSocketId(), m.id, self, self.get(await self._getPublicKey(peer)), m).connect();
                    return;
                }
                const socket = self._sockets.get(m.id);
                if (socket) {
                    socket.remoteId = m.remoteId;
                    // @ts-ignore
                    socket.emit("connect");
                }
            },
        });
        this.update(await this._getPublicKey(peer), {
            messages: { openSocket: message },
        });
    }
    async _registerWriteSocketMessage(peer) {
        const self = this;
        const message = await peer.channel.addMessage({
            encoding: writeSocketEncoding,
            onmessage(m) {
                self._sockets.get(m.id)?.push(b4a_1.default.from(m.data));
            },
        });
        this.update(await this._getPublicKey(peer), {
            messages: { writeSocket: message },
        });
    }
    async _registerCloseSocketMessage(peer) {
        const self = this;
        const message = await peer.channel.addMessage({
            encoding: socketEncoding,
            onmessage(m) {
                self._sockets.get(m.id)?.end();
            },
        });
        this.update(await this._getPublicKey(peer), {
            messages: { closeSocket: message },
        });
    }
    async _registerTimeoutSocketMessage(peer) {
        const self = this;
        const message = await peer.channel.addMessage({
            encoding: socketEncoding,
            onmessage(m) {
                // @ts-ignore
                self._sockets.get(m.id)?.emit("timeout");
            },
        });
        this.update(await this._getPublicKey(peer), {
            messages: { timeoutSocket: message },
        });
    }
    async _registerErrorSocketMessage(peer) {
        const self = this;
        const message = await peer.channel.addMessage({
            encoding: errorSocketEncoding,
            onmessage(m) {
                // @ts-ignore
                self._sockets.get(m.id)?.emit("error", m.err);
            },
        });
        this.update(await this._getPublicKey(peer), {
            messages: { errorSocket: message },
        });
    }
    _toString(pubkey) {
        return b4a_1.default.from(pubkey).toString("hex");
    }
    async _getPublicKey(peer) {
        return (0, util_js_1.maybeGetAsyncProperty)(peer.stream.remotePublicKey);
    }
}
exports.default = MultiSocketProxy;
