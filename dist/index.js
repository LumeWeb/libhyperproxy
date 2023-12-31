"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = exports.createSocket = exports.MultiSocketProxy = exports.BasicProxy = exports.TcpSocket = exports.DummySocket = exports.Peer = exports.Server = exports.Socket = exports.Proxy = void 0;
const proxy_js_1 = __importDefault(require("./proxy.js"));
exports.Proxy = proxy_js_1.default;
const socket_js_1 = __importDefault(require("./socket.js"));
exports.Socket = socket_js_1.default;
const peer_js_1 = __importDefault(require("./peer.js"));
exports.Peer = peer_js_1.default;
const server_js_1 = __importDefault(require("./server.js"));
exports.Server = server_js_1.default;
const dummySocket_js_1 = __importDefault(require("./proxies/multiSocket/dummySocket.js"));
exports.DummySocket = dummySocket_js_1.default;
const tcpSocket_js_1 = __importDefault(require("./proxies/multiSocket/tcpSocket.js"));
exports.TcpSocket = tcpSocket_js_1.default;
const basic_js_1 = __importDefault(require("./proxies/basic.js"));
exports.BasicProxy = basic_js_1.default;
const multiSocket_js_1 = __importDefault(require("./proxies/multiSocket.js"));
exports.MultiSocketProxy = multiSocket_js_1.default;
function createSocket(port, host) {
    return new socket_js_1.default({
        remotePort: port,
        remoteAddress: host,
    });
}
exports.createSocket = createSocket;
function createServer() {
    return new server_js_1.default();
}
exports.createServer = createServer;
