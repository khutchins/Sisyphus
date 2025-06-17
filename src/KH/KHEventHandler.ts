class KHEvent<T> {
    name: T;
    callbacks: { (data: any): void; }[];
    callbackMap: Map<unknown, { (data: any): void; }[]>;
    onceCallbacks: { (data: any): void; }[];
    onceCallbackMap: Map<unknown, { (data: any): void; }[]>;

    constructor(name: T)  {
        this.name = name;
        this.callbacks = [];
        this.callbackMap = new Map();
        this.onceCallbacks = [];
        this.onceCallbackMap = new Map();
    }

    registerCallback(cb: (data: any) => void) {
        this.callbacks.push(cb);
    }

    registerCallbackForObject(obj: unknown, cb: (data: any) => void) {
        const arr = this.ensureExists(this.callbackMap, obj);
        arr.push(cb);
        this.registerCallback(cb);
    }

    registerOnceCallback(cb: (data: any) => void) {
      this.onceCallbacks.push(cb);
    }
  
    registerOnceCallbackForObject(obj: unknown, cb: (data: any) => void) {
        const arr = this.ensureExists(this.onceCallbackMap, obj);
        arr.push(cb);
        this.registerOnceCallback(cb);
    }

    unregisterCallback(cb: (data: any) => void) { 
        let idx = this.callbacks.indexOf(cb);
        if (idx < 0) return;
        this.callbacks.splice(idx, 1);
    }

    unregisterCallbacksForObject(obj: unknown) {
        const arr = this.callbackMap.get(obj);
        if (arr) {
            for (let cb of arr) {
                this.unregisterCallback(cb);
            }
            this.callbackMap.delete(obj);
        }

        const onceArr = this.onceCallbackMap.get(obj);
        if (onceArr) {
            for (let cb of onceArr) {
                this.unregisterOnceCallback(cb);
            }
            this.onceCallbackMap.delete(obj);
        }
    }

    unregisterOnceCallback(cb: (data: any) => void) {
        let idx = this.onceCallbacks.indexOf(cb);
        if (idx < 0) return;
        this.onceCallbacks.splice(idx, 1);
    }

    emitEvent(data: unknown) {
        this.callbacks.forEach(function(callback){
            callback(data);
        });
        this.onceCallbacks.forEach(callback => {
            callback(data);
        });
        this.onceCallbacks = [];
        this.onceCallbackMap.clear();

    }

    private ensureExists<V>(map: Map<unknown, V[]>, key: unknown): V[] {
        let arr = map.get(key);
        if (!arr) {
            arr = [];
            map.set(key, arr);
        }
        return arr;
    } 
}

export interface KHEventMap {}

export class KHEventHandler<T extends KHEventMap> {
    events: Map<keyof T, KHEvent<keyof T>> = new Map();

    private ensureEvent(name: keyof T) {
        let val = this.events.get(name);
        if (!val) {
            val = new KHEvent(name);
            this.events.set(name, val);
        }
        return val;
    }

    emitEvent(name: keyof T, args: T[keyof T]) {
        this.ensureEvent(name).emitEvent(args);
    }

    registerCallback<E extends keyof T>(name: E, listener: (ev: T[E]) => void) {
        this.ensureEvent(name).registerCallback(listener);
    }

    on<E extends keyof T>(name: E, listener: (ev: T[E]) => void) {
        this.registerCallback(name, listener);
    }

    registerCallbackForObject<E extends keyof T>(name: E, registrar: unknown, listener: (ev: T[E]) => void) {
        this.ensureEvent(name).registerCallbackForObject(registrar, listener);
    }

    onFor<E extends keyof T>(name: E, registrar: unknown, listener: (ev: T[E]) => void) {
        this.registerCallbackForObject(name, registrar, listener);
    }

    registerOnceCallback<E extends keyof T>(name: E, listener: (ev: T[E]) => void) {
        this.ensureEvent(name).registerOnceCallback(listener);
    }

    onceFor<E extends keyof T>(name: E, registrar: unknown, listener: (ev: T[E]) => void) {
        this.registerOnceCallbackForObject(name, registrar, listener);
    }

    once<E extends keyof T>(name: E, listener: (ev: T[E]) => void) {
        this.registerOnceCallback(name, listener);
    }

    registerOnceCallbackForObject<E extends keyof T>(name: E, registrar: unknown, listener: (ev: T[E]) => void) {
      this.ensureEvent(name).registerOnceCallbackForObject(registrar, listener);
    }

    unregisterCallback<E extends keyof T>(name: E, cb: (ev: T[E]) => void) {
        this.ensureEvent(name).unregisterCallback(cb);
    }

    off<E extends keyof T>(name: E, cb: (ev: T[E]) => void) {
        this.unregisterCallback(name, cb);
    }

    unregisterCallbacksForObject<E extends keyof T>(name: E, registrar: unknown) {
        let val = this.events.get(name);
        if (val) {
            val.unregisterCallbacksForObject(registrar);
        }
    }

    offFor<E extends keyof T>(name: E, registrar: unknown) {
        this.unregisterCallbacksForObject(name, registrar);
    }

    unregisterAllCallbacksForObject(registrar: unknown) {
        for (let event of this.events.values()) {
            event.unregisterCallbacksForObject(registrar);
        }
    }

    offAllFor(registrar: unknown) {
        this.unregisterAllCallbacksForObject(registrar);
    }
}
