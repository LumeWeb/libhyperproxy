import BasePeer from "../../peer.js";
import Socket from "../../socket.js";
export default class Peer extends BasePeer {
    private _pipe?;
    protected initSocket(): Promise<void>;
    protected handleChannelOnOpen(m: any): Promise<void>;
    protected handleChannelOnClose(socket: Socket): Promise<void>;
    protected initMessages(): Promise<void>;
}
