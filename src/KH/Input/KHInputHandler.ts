import { KHInputKey } from "./Key/KHInputKey";
import { KHIInputRegistrar } from "./KHIInputRegistrar";
import { KHInputSet } from "./KHInputSet";

export class KHInputHandler {
    scene: Phaser.Scene;
    mappings: Map<string, KHInputKey[]>;
    readonly inputSet: KHInputSet;

    constructor(scene: Phaser.Scene, inputs: { [key: string]: KHInputKey | KHInputKey[] }, inputSet: KHInputSet) {
        this.scene = scene;
        this.mappings = new Map();
        for (const key in inputs) {
            let val = inputs[key];
            if (val instanceof KHInputKey) {
                val = [ val ];
            }
            this.mappings.set(key, val);
        }
        this.inputSet = inputSet;
    }

    register(registrar: KHIInputRegistrar) {
        this.inputSet.registerWith(registrar);
    }

    unregister() {
        this.inputSet.unregister();
    }

    /**
     * Returns if key was pressed down this frame.
     */
    isJustDown(key: string): boolean {
        if (!this.inputSet.registered()) {
            console.warn("Attempting to get inputs with unregistered input set. Call register first.");
        }
        let mappings: KHInputKey[] = this.mappings.get(key);
        if (!mappings) { 
            console.log("No mappings for " + key);
            return;
        }

        for (let i = 0; i < mappings.length; i++) {
            if (mappings[i].isJustDown()) return true;
        }

        return false;
    }

    /**
     * Returns if key is currently down.
     */
    isDown(key: string): boolean {
        if (!this.inputSet.registered()) {
            console.warn("Attempting to get inputs with unregistered input set. Call register first.");
        }
        let mappings: KHInputKey[] = this.mappings.get(key);
        if (!mappings) { 
            console.log("No mappings for " + key);
            return;
        }

        for (let i = 0; i < mappings.length; i++) {
            if (mappings[i].isDown()) return true;
        }
        
        return false;
    }
}