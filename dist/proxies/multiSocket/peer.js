"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const peer_js_1 = __importDefault(require("../../peer.js"));
class Peer extends peer_js_1.default {
    async initMessages() {
        await this._proxy.handleNewPeerChannel(this);
    }
    async initSocket() { }
    get stream() {
        return this._muxer.stream;
    }
    async handleChannelOnClose(socket) {
        return this._proxy.handleClosePeer(this);
    }
    async handleChannelOnOpen(m) { }
}
exports.default = Peer;
