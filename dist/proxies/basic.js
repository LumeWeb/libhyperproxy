"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const proxy_js_1 = __importDefault(require("../proxy.js"));
const peer_js_1 = __importDefault(require("./basic/peer.js"));
class BasicProxy extends proxy_js_1.default {
    handlePeer({ peer, muxer, ...options }) {
        const conn = new peer_js_1.default({ proxy: this, peer, muxer, ...options });
        conn.init();
    }
}
exports.default = BasicProxy;
