import Proxy from "./proxy.js";
import Socket from "./socket.js";
import Peer, {
  DataSocketOptions,
  PeerOptions,
  PeerOptionsWithProxy,
  OnOpen,
  OnSend,
  OnReceive,
  OnClose,
} from "./peer.js";
import Server from "./server.js";
import DummySocket from "./proxies/multiSocket/dummySocket.js";
import TcpSocket from "./proxies/multiSocket/tcpSocket.js";
import BasicProxy from "./proxies/basic.js";
import MultiSocketProxy from "./proxies/multiSocket.js";

export {
  Proxy,
  Socket,
  Server,
  Peer,
  DataSocketOptions,
  PeerOptions,
  PeerOptionsWithProxy,
  OnOpen,
  OnSend,
  OnReceive,
  OnClose,
  DummySocket,
  TcpSocket,
  BasicProxy,
  MultiSocketProxy,
};

export function createSocket(port: number, host: string): Socket {
  return new Socket({
    remotePort: port,
    remoteAddress: host,
  });
}

export function createServer(): Server {
  return new Server();
}
