import { KHInputAxis } from "./Axis/KHInputAxis";
import { KHInputKey } from "./Key/KHInputKey";
import { KHIInputRegistrar } from "./KHIInputRegistrar";
import { KHInputSet } from "./KHInputSet";

export enum KHAxisStatus {
    Value = 0,
    Changed = 1,
}

export enum KHInputStatus {
    JustDown = 0,
    Down = 1,
}

export enum KHInputType {
    Key = 0,
    Axis = 1,
}

export type KHInputState = [Map<number, [boolean, boolean]>, Map<number, [number, boolean]>];

export class KHController {
    private inputs: Map<number, KHInputKey>;
    private axes: Map<number, KHInputAxis>;
    private registered: boolean;
    readonly inputSet: KHInputSet;

    constructor(inputMap: Map<number, KHInputKey>, axisMap: Map<number, KHInputAxis>, inputSet: KHInputSet) {
        this.inputs = new Map(inputMap);
        this.axes = new Map(axisMap);
        this.inputSet = inputSet;
    }

    register(registrar: KHIInputRegistrar) {
        this.registered = registrar != null;
        this.inputSet.registerWith(registrar);
    }

    unregister() {
        this.registered = false;
        this.inputSet.unregister();
    }

    getStatus(): KHInputState {
        if (!this.inputSet.registered()) {
            console.warn("Attempting to get inputs with unregistered input set. Call register first.");
        }
        let inputs: Map<number, [boolean, boolean]> = new Map();
        this.inputs.forEach((value, key) => {
            inputs.set(key, [ value.isJustDown(), value.isDown() ]);
        })
        let axes: Map<number, [number, boolean]> = new Map();
        this.axes.forEach((value, key) => {
            axes.set(key, [ value.getValue(), value.changed() ]);
        })
        return [inputs, axes];
    }

    getInput(input: number): KHInputKey {
        if (this.inputs.has(input)) {
            return this.inputs.get(input);
        }
        return null;
    }

    getAxis(axis: number): KHInputAxis {
        if (this.axes.has(axis)) {
            return this.axes.get(axis);
        }
        return null;
    }

    getIsAxisUpdated(axis: number): boolean {
        if (!this.axes.has(axis)) {
            return false;
        }
        let input = this.axes.get(axis);
        return input.getValue() != input.getLastValue();
    }

    /**
     * Injects a new input for an existing one. Useful if you want to use a 
     * resettable key, for instance.
     * @param input 
     * @param newInput 
     */
    inject(input: number, newInput: KHInputKey) {
        this.inputs.set(input, newInput);
    }
}