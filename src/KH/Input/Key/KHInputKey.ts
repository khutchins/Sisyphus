import { KHEventHandler, KHEventMap } from "../../KHEventHandler";

interface KHInputKeyEventMap extends KHEventMap {
    /** Key updated. */
    "ku": null;
}

/**
 * Input key that specifies the state of one key. Managers of this key must
 * update it once and only once per frame, or strange behavior can occur.
 */
export class KHInputKey extends KHEventHandler<KHInputKeyEventMap> {
    protected down: boolean;
    protected justDown: boolean;

    static EVENT_KEY_UPDATE: string = "ku";
    
    constructor() {
        super();
        this.down = false;
        this.justDown = false;
    }

    update(down: boolean) {
        let justDown = down && !this.down;
        this.updateInternal(down, justDown);
    }

    protected updateInternal(down: boolean, justDown: boolean) {
        let changed = this.justDown != justDown || this.down != down;
        this.justDown = justDown;
        this.down = down;
        if (changed) {
            this.emitEvent("ku", null);
        }
    }

    isDown(): boolean {
        return this.down;
    }

    isJustDown(): boolean {
        return this.justDown;
    }
}
