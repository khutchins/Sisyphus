class KHEvent {
    name: string;
    callbacks: { (data: any): void; }[];

    constructor(name)  {
        this.name = name;
        this.callbacks = [];
    }

    registerCallback(cb: (data: any) => void) {
        this.callbacks.push(cb);
    }

    unregisterCallback(cb: (data: any) => void) { 
        let idx = this.callbacks.indexOf(cb);
        if (idx < 0) return;
        this.callbacks.splice(idx, 1);
    }

    emitEvent(data: {}) {
        this.callbacks.forEach(function(callback){
            callback(data);
        });
    }
}

export interface KHEventMap {}

export class KHEventHandler<T extends KHEventMap> {
    events: Map<keyof T, KHEvent>;

    constructor() {
        this.events = new Map();
    }

    private ensureEvent(name: keyof T) {
        let val = this.events.get(name);
        if (!val) {
            val = new KHEvent(name);
            this.events.set(name, val);
        }
        return val;
    }

    emitEvent<E extends keyof T>(name: E, args: T[E]) {
        this.ensureEvent(name).emitEvent(args);
    }

    registerCallback<E extends keyof T>(name: E, listener: (ev: T[E]) => void) {
        this.ensureEvent(name).registerCallback(listener);
    }

    unregisterCallback<E extends keyof T>(name: E, cb: (ev: T[E]) => void) {
        this.ensureEvent(name).unregisterCallback(cb);
    }
}