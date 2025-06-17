import { KHInputKey } from "../Input/Key/KHInputKey";
import { KHInputHandler } from "../Input/KHInputHandler";
import { KHInputSet } from "../Input/KHInputSet";

export class KHListInputs {
    static Up = "up";
    static Left = "left";
    static Right = "right";
    static Down = "down";
    static Back = "back";
}

/**
 * Helper for setting up input handlers for menus.
 */
export class KHListInputHandler extends KHInputHandler {
    constructor(scene: Phaser.Scene, left: KHInputKey, right: KHInputKey, up: KHInputKey, down: KHInputKey, back: KHInputKey, inputSet: KHInputSet) {
        super(scene, {
            [KHListInputs.Left]: left,
            [KHListInputs.Right]: right,
            [KHListInputs.Up]: up,
            [KHListInputs.Down]: down,
            [KHListInputs.Back]: back,
        }, inputSet);
    }
}