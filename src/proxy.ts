import Protomux from "protomux";
import Peer, { PeerOptions, DataSocketOptions } from "./peer.js";

export interface ProxyOptions extends DataSocketOptions {
  swarm: any;
  protocol: string;
  listen?: boolean;
  autostart?: boolean;
}

export default abstract class Proxy {
  protected _listen: any;
  protected _autostart: boolean;

  constructor({
    swarm,
    protocol,
    onopen,
    onreceive,
    onsend,
    onclose,
    onchannel,
    listen = false,
    autostart = false,
    emulateWebsocket = false,
    createDefaultMessage = true,
  }: ProxyOptions) {
    this._swarm = swarm;
    this._protocol = protocol;
    this._listen = listen;
    this._autostart = autostart;
    this._socketOptions = {
      onopen,
      onreceive,
      onsend,
      onclose,
      onchannel,
      emulateWebsocket,
      createDefaultMessage,
    };
    this.init();
  }

  protected _socketOptions: DataSocketOptions;

  get socketOptions(): DataSocketOptions {
    return this._socketOptions;
  }

  private _swarm: any;

  get swarm(): any {
    return this._swarm;
  }

  private _protocol: string;

  get protocol(): string {
    return this._protocol;
  }
  public handlePeer({
    peer,
    muxer,
    ...options
  }: DataSocketOptions & PeerOptions) {
    const conn = new Peer({ proxy: this, peer, muxer, ...options });
    conn.init();
  }

  protected _init() {
    // Implement in subclasses
  }

  private async init() {
    if (this._listen) {
      this._swarm.on("connection", this._handleConnection.bind(this));
    }
    await this._init();
  }

  private _handleConnection(peer: any) {
    const muxer = Protomux.from(peer);
    const handlePeer = this.handlePeer.bind(this, {
      peer,
      muxer,
      ...this._socketOptions,
    });

    if (this._autostart) {
      handlePeer();
      return;
    }

    muxer.pair(this._protocol, handlePeer);
  }
}
