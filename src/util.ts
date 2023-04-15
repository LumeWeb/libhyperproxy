export function idFactory(start: number, step = 1, limit = 2 ** 32) {
  let id = start;

  return function nextId() {
    const nextId = id;
    id += step;
    if (id >= limit) id = start;
    return nextId;
  };
}
export function roundRobinFactory<T>(list: Map<string, any>) {
  let index = 0;

  return (): T => {
    const keys = [...list.keys()].sort();
    if (index >= keys.length) {
      index = 0;
    }

    return list.get(keys[index++]);
  };
}
export async function maybeGetAsyncProperty(object: any) {
  if (typeof object === "function") {
    object = object();
  }

  if (isPromise(object)) {
    object = await object;
  }

  return object;
}
export function isPromise(obj: Promise<any>) {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof obj.then === "function"
  );
}
