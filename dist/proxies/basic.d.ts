import Proxy from "../proxy.js";
import { DataSocketOptions, PeerOptions } from "../peer.js";
export default class BasicProxy extends Proxy {
    protected handlePeer({ peer, muxer, ...options }: DataSocketOptions & PeerOptions): void;
}
