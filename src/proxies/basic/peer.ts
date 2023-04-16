import BasePeer from "../../peer.js";
import { maybeGetAsyncProperty } from "../../util.js";
import Socket from "../../socket.js";
import { Buffer } from "buffer";

export default class Peer extends BasePeer {
  private _pipe?: any;
  protected async initSocket() {
    const self = this;

    const raw = await maybeGetAsyncProperty(self._peer.rawStream);
    this._socket = new Socket({
      remoteAddress: raw.remoteHost,
      remotePort: raw.remotePort,
      remotePublicKey: await maybeGetAsyncProperty(self._peer.remotePublicKey),
      async write(data: any, cb: Function) {
        self._pipe?.send(data);
        await self._onsend?.(data);
        cb();
      },
      emulateWebsocket: self._emulateWebsocket,
    });
  }

  protected async handleChannelOnOpen(m: any) {
    if (!m) {
      m = Buffer.from([]);
    }

    if (m instanceof Uint8Array) {
      m = Buffer.from(m);
    }

    this._socket?.on("end", () => this._channel.close());
    let ret = await this._onopen?.(this._socket, m);
    if (!ret || (ret && ret.connect === false)) {
      // @ts-ignore
      self._socket?.emit("connect");
    }

    this._socket?.emit("data", m);
  }

  protected async handleChannelOnClose(socket: Socket): Promise<void> {
    this._socket?.destroy();
  }

  protected async initMessages(): Promise<void> {
    const self = this;
    this._pipe = await this._channel.addMessage({
      async onmessage(m: any) {
        if (m instanceof Uint8Array) {
          m = Buffer.from(m);
        }
        self._socket.emit("data", m);
        await self._onreceive?.(m);
      },
    });
  }
}
