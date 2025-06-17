import { KHReference } from "../../References/KHReference";
import { KHInputKey } from "./KHInputKey";
import { KHInputKeyDerived } from "./KHInputKeyDerived";
import { KHInputSet } from "../KHInputSet";

export class KHInputKeyConditional extends KHInputKeyDerived {
    private _source: KHInputKey;
    private _conditional: KHReference<boolean>;
    private _invert: boolean;

    constructor(inputSet: KHInputSet, source: KHInputKey, conditional: KHReference<boolean>, invert: boolean = false) {
        super(inputSet);
        this._source = source;
        this._conditional = conditional;
        this._invert = invert;

        // Clear out just down if not applicable.
        this.setInitalState();
    }

    private setInitalState(): void {
        this.down = this._source.isDown() && this.getConditional();
        this.justDown = this._source.isJustDown() && this.getConditional();
    }

    private getConditional(): boolean {
        const bool = this._conditional.get();
        return this._invert ? !bool : bool;
    }

    updateDerivedInput() {
        super.update(this._source.isDown() && this.getConditional());
    }
}