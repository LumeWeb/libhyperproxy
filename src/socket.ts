import { Duplex, DuplexEvents, Callback } from "streamx";

const IPV4 = "IPv4";
const IPV6 = "IPv6";

type AddressFamily = "IPv6" | "IPv4";

interface SocketOptions {
  allowHalfOpen?: boolean;
  remoteAddress?: string;
  remotePort?: number;
  remotePublicKey?: Uint8Array;
  write?: (
    this: Duplex<any, any, any, any, true, true, DuplexEvents<any, any>>,
    data: any,
    cb: Callback
  ) => void;
}

export default class Socket extends Duplex {
  private _allowHalfOpen: boolean;
  public remoteAddress: any;
  public remotePort: any;
  public remoteFamily: AddressFamily;

  public bufferSize;

  declare readable: true;
  declare writable: true;
  public remotePublicKey: Uint8Array;

  constructor({
    allowHalfOpen = false,
    remoteAddress,
    remotePort,
    remotePublicKey,
    write,
  }: SocketOptions = {}) {
    super({ write });
    this._allowHalfOpen = allowHalfOpen;
    this.remoteAddress = remoteAddress;
    this.remotePort = remotePort;
    this.remotePublicKey = remotePublicKey;

    if (remoteAddress) {
      const type = Socket.isIP(remoteAddress);
      if (!type) {
        throw Error("invalid remoteAddress");
      }

      this.remoteFamily = type === 6 ? IPV6 : IPV4;
    }
  }

  private _connecting: boolean;

  get connecting(): boolean {
    return this._connecting;
  }

  get readyState(): string {
    if (this._connecting) {
      return "opening";
    } else if (this.readable && this.writable) {
      return "open";
    } else if (this.readable && !this.writable) {
      return "readOnly";
    } else if (!this.readable && this.writable) {
      return "writeOnly";
    } else {
      return "closed";
    }
  }

  listen() {
    throw new Error("Not supported");
  }

  setTimeout(msecs, callback) {
    throw new Error("Not implemented");
  }

  _onTimeout() {
    // @ts-ignore
    this.emit("timeout");
  }

  setNoDelay(enable: boolean) {}

  setKeepAlive(setting: any, msecs: number) {}

  address() {
    return {
      address: this.remoteAddress,
      port: this.remotePort,
      family: this.remoteFamily,
    };
  }

  addEventListener = this.addListener;
  on = this.addListener;
  removeEventListener = this.removeListener;
  off = this.removeListener;

  static isIP(input: string): number {
    if (Socket.isIPv4(input)) {
      return 4;
    } else if (Socket.isIPv6(input)) {
      return 6;
    } else {
      return 0;
    }
  }

  static isIPv4(input: string) {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
      input
    );
  }

  static isIPv6(input: string) {
    return /^(([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))$/.test(
      input
    );
  }
}
