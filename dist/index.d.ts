import Proxy from "./proxy.js";
import Socket from "./socket.js";
import Peer, { DataSocketOptions, PeerOptions, PeerOptionsWithProxy, OnOpen, OnSend, OnReceive, OnClose } from "./peer.js";
import Server from "./server.js";
export { Proxy, Socket, Server, Peer, DataSocketOptions, PeerOptions, PeerOptionsWithProxy, OnOpen, OnSend, OnReceive, OnClose, };
export declare function createSocket(port: number, host: string): Socket;
export declare function createServer(): Server;
