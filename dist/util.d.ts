export declare function idFactory(start: number, step?: number, limit?: number): () => number;
export declare function roundRobinFactory<T>(list: Map<string, any>): () => T;
export declare function maybeGetAsyncProperty(object: any): Promise<any>;
export declare function isPromise(obj: Promise<any>): boolean;
