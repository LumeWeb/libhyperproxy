import BasePeer from "../../peer.js";
import Socket from "../../socket.js";
import MultiSocketProxy from "../multiSocket.js";
export default class Peer extends BasePeer {
    protected initMessages(): Promise<void>;
    protected _proxy: MultiSocketProxy;
    protected initSocket(): Promise<void>;
    get stream(): any;
    protected handleChannelOnClose(socket: Socket): Promise<void>;
    protected handleChannelOnOpen(m: any): Promise<void>;
}
