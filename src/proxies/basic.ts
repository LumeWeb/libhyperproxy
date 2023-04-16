import Proxy from "../proxy.js";
import { DataSocketOptions, PeerOptions } from "../peer.js";
import BasicPeer from "./basic/peer.js";

export default class BasicProxy extends Proxy {
  protected handlePeer({
    peer,
    muxer,
    ...options
  }: DataSocketOptions & PeerOptions) {
    const conn = new BasicPeer({ proxy: this, peer, muxer, ...options });
    conn.init();
  }
}
