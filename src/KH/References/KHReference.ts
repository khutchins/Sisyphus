import { KHEventHandler, KHEventMap } from "../KHEventHandler";

export interface KHReferenceEventMap<T> extends KHEventMap {
    "valueChanged": {newValue: T};
}

export class KHReference<T> extends KHEventHandler<KHReferenceEventMap<T>> {
    protected value: T;

    constructor(value: T) {
        super();
        this.value = value;
    }

    set(value: T) {
        const changed = this.value !== value;
        this.value = value;
        if (changed) {
            this.emitEvent("valueChanged", {newValue: this.value});
        }
    }

    get(): T {
        return this.value;
    }
}