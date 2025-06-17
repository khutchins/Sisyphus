import { KHEventHandler, KHEventMap } from "../../KHEventHandler";

interface KHInputAxisEventMap extends KHEventMap {
    "au": null;
}

/**
 * Input axis that specifies the state of one axis. Managers of this axis must
 * update it once and only once per frame, or strange behavior can occur.
 */
export class KHInputAxis extends KHEventHandler<KHInputAxisEventMap> {
    protected value: number;
    protected lastValue: number;

    static EVENT_AXIS_UPDATE: string = "au";
    
    constructor() {
        super();
        this.value = 0;
    }

    /**
     * Updates the axis value to the value passed in. Returns whether or not
     * the value changed.
     */
    update(value: number): boolean {
        let changed = this.value != value;
        this.lastValue = this.value;
        this.value = value;
        if (changed) {
            this.emitEvent("au", null);
        }
        return changed;
    }
    
    getValue(): number {
        return this.value;
    }

    getLastValue(): number {
        return this.lastValue;
    }

    changed(): boolean {
        return this.value != this.lastValue;
    }
}
