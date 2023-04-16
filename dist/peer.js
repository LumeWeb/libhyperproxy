"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    constructor({ proxy, peer, muxer, onopen, onreceive, onsend, onclose, onchannel, emulateWebsocket = false, }) {
        this._proxy = proxy;
        this._peer = peer;
        this._muxer = muxer;
        this._onopen = onopen?.bind(undefined, this);
        this._onreceive = onreceive?.bind(undefined, this);
        this._onsend = onsend?.bind(undefined, this);
        this._onclose = onclose?.bind(undefined, this);
        this._onchannel = onchannel?.bind(undefined, this);
        this._emulateWebsocket = emulateWebsocket;
    }
    _socket;
    get socket() {
        return this._socket;
    }
    _channel;
    get channel() {
        return this._channel;
    }
    async initChannel() {
        const self = this;
        this._channel = await this._muxer.createChannel({
            protocol: this._proxy.protocol,
            onopen: this.handleChannelOnOpen.bind(this),
            onclose: this.handleChannelOnClose.bind(this),
        });
        await this.initMessages();
        await this._onchannel?.(this._channel);
        await this._channel.open();
    }
    async init() {
        await this.initSocket();
        await this.initChannel();
    }
    async initMessages() { }
}
exports.default = Peer;
