"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const protomux_1 = __importDefault(require("protomux"));
const events_1 = __importDefault(require("events"));
class Proxy extends events_1.default {
    _listen;
    _autostart;
    constructor({ swarm, protocol, onopen, onreceive, onsend, onclose, onchannel, listen = false, autostart = false, emulateWebsocket = false, }) {
        super();
        this._swarm = swarm;
        this._protocol = protocol;
        this._listen = listen;
        this._autostart = autostart;
        this._socketOptions = {
            onopen,
            onreceive,
            onsend,
            onclose,
            onchannel,
            emulateWebsocket,
        };
        this.init();
    }
    _socketOptions;
    get socketOptions() {
        return this._socketOptions;
    }
    _swarm;
    get swarm() {
        return this._swarm;
    }
    _protocol;
    get protocol() {
        return this._protocol;
    }
    _init() {
        // Implement in subclasses
    }
    async init() {
        if (this._listen) {
            this._swarm.on("connection", this._handleConnection.bind(this));
        }
        await this._init();
    }
    _handleConnection(peer) {
        const muxer = protomux_1.default.from(peer);
        const handlePeer = this.handlePeer.bind(this, {
            peer,
            muxer,
            ...this._socketOptions,
        });
        if (this._autostart) {
            handlePeer();
            return;
        }
        muxer.pair(this._protocol, handlePeer);
    }
}
exports.default = Proxy;
