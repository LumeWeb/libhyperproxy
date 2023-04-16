import BasePeer from "../../peer.js";
import Socket from "../../socket.js";
import MultiSocketProxy from "../multiSocket.js";

export default class Peer extends BasePeer {
  protected declare _proxy: MultiSocketProxy;
  protected async initSocket() {}

  protected async handleChannelOnClose(socket: Socket): Promise<void> {
    return this._proxy.handleClosePeer(this);
  }

  protected async handleChannelOnOpen(m: any): Promise<void> {
    await this._proxy.handleNewPeerChannel(this._peer, this._channel);
  }
}
