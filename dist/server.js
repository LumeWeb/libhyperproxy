"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
class Server extends events_1.default {
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
    async listen(...args) {
        const address = this.address();
        this.emit("listening", address);
        return address;
    }
    get listening() {
        return false;
    }
    set listening(value) { }
    get maxConnections() {
        return undefined;
    }
    set maxConnections(value) { }
    ref() {
        return this;
    }
    unref() {
        return this;
    }
}
exports.default = Server;
