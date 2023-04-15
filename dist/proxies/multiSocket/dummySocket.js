"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const streamx_1 = require("streamx");
const timers_1 = require("timers");
const util_js_1 = require("../../util.js");
class DummySocket extends streamx_1.Duplex {
    _options;
    _id;
    _proxy;
    _connectTimeout;
    constructor(id, manager, peer, options) {
        super();
        this._id = id;
        this._proxy = manager;
        this._peer = peer;
        this._options = options;
        // @ts-ignore
        this.on("timeout", () => {
            if (this._connectTimeout) {
                (0, timers_1.clearTimeout)(this._connectTimeout);
            }
        });
    }
    _remoteId = 0;
    set remoteId(value) {
        this._remoteId = value;
        this._proxy.socketMap.set(this._id, value);
    }
    _peer;
    get peer() {
        return this._peer;
    }
    async _write(data, cb) {
        (await (0, util_js_1.maybeGetAsyncProperty)(this._peer.messages.writeSocket))?.send({
            id: this._id,
            remoteId: this._remoteId,
            data,
        });
        cb();
    }
    async _destroy(cb) {
        (await (0, util_js_1.maybeGetAsyncProperty)(this._peer.messages.closeSocket))?.send({
            id: this._id,
            remoteId: this._remoteId,
        });
        this._proxy.socketMap.delete(this._id);
        this._proxy.sockets.delete(this._id);
    }
    async connect() {
        (await (0, util_js_1.maybeGetAsyncProperty)(this._peer.messages.openSocket))?.send({
            ...this._options,
            id: this._id,
        });
    }
    setTimeout(ms, cb) {
        if (this._connectTimeout) {
            (0, timers_1.clearTimeout)(this._connectTimeout);
        }
        this._connectTimeout = setTimeout(() => {
            cb && cb();
        }, ms);
    }
}
exports.default = DummySocket;
