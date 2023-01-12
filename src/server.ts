import EventEmitter from "events";

export default class Server extends EventEmitter {
  address() {
    return {
      address: "127.0.0.1",
      family: "IPv4",
      port: 0,
    };
  }

  async close() {
    return;
  }

  async getConnections() {
    return 0;
  }

  async listen(...args: any[]) {
    const address = this.address();
    this.emit("listening", address);
    return address;
  }

  get listening() {
    return false;
  }

  set listening(value) {}

  get maxConnections() {
    return undefined;
  }

  set maxConnections(value) {}

  ref() {
    return this;
  }

  unref() {
    return this;
  }
}
