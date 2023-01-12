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
