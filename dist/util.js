"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPromise = exports.maybeGetAsyncProperty = exports.roundRobinFactory = exports.idFactory = void 0;
function idFactory(start, step = 1, limit = 2 ** 32) {
    let id = start;
    return function nextId() {
        const nextId = id;
        id += step;
        if (id >= limit)
            id = start;
        return nextId;
    };
}
exports.idFactory = idFactory;
function roundRobinFactory(list) {
    let index = 0;
    return () => {
        const keys = [...list.keys()].sort();
        if (index >= keys.length) {
            index = 0;
        }
        return list.get(keys[index++]);
    };
}
exports.roundRobinFactory = roundRobinFactory;
async function maybeGetAsyncProperty(object) {
    if (typeof object === "function") {
        object = object();
    }
    if (isPromise(object)) {
        object = await object;
    }
    return object;
}
exports.maybeGetAsyncProperty = maybeGetAsyncProperty;
function isPromise(obj) {
    return (!!obj &&
        (typeof obj === "object" || typeof obj === "function") &&
        typeof obj.then === "function");
}
exports.isPromise = isPromise;
