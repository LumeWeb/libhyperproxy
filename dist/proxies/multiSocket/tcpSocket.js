"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net = __importStar(require("net"));
const socket_js_1 = __importDefault(require("../../socket.js"));
class TcpSocket extends socket_js_1.default {
    _options;
    _id;
    _remoteId;
    _proxy;
    _socket;
    constructor(id, remoteId, manager, peer, options) {
        super();
        this._remoteId = remoteId;
        this._proxy = manager;
        this._id = id;
        this._peer = peer;
        this._options = options;
        this._proxy.sockets.set(this._id, this);
        this._proxy.socketMap.set(this._id, this._remoteId);
    }
    _peer;
    get peer() {
        return this._peer;
    }
    _write(data, cb) {
        this._peer.messages.writeSocket?.send({
            ...this._getSocketRequest(),
            data,
        });
        cb();
    }
    _destroy(cb) {
        this._proxy.sockets.delete(this._id);
        this._proxy.socketMap.delete(this._id);
        this._peer.messages.closeSocket?.send(this._getSocketRequest());
    }
    connect() {
        this.on("error", (err) => {
            this._peer.messages.errorSocket?.send({
                ...this._getSocketRequest(),
                err,
            });
        });
        // @ts-ignore
        this.on("timeout", () => {
            this._peer.messages.timeoutSocket?.send(this._getSocketRequest());
        });
        // @ts-ignore
        this.on("connect", () => {
            this._peer.messages.openSocket?.send(this._getSocketRequest());
        });
        this._socket = net.connect(this._options);
        ["timeout", "error", "connect", "end", "destroy", "close"].forEach((event) => {
            this._socket?.on(event, (...args) => this.emit(event, ...args));
        });
        this._socket.pipe(this);
        this.pipe(this._socket);
    }
    _getSocketRequest() {
        return {
            id: this._id,
            remoteId: this._remoteId,
        };
    }
}
exports.default = TcpSocket;
