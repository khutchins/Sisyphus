import { KHReference } from "../References/KHReference";
import { KHInputAxis } from "./Axis/KHInputAxis";
import { KHInputAxisDeadZoneScaledAxial } from "./Axis/KHInputAxisDeadZoneScaledAxial";
import { KHInputAxisDeadZoneScaledRadial } from "./Axis/KHInputAxisDeadZoneScaledRadial";
import { KHInputAxisHighestMagnitude } from "./Axis/KHInputAxisHighestMagnitude";
import { KHInputKey } from "./Key/KHInputKey";
import { KHInputKeyConditional } from "./Key/KHInputKeyConditional";
import { KHInputKeyOr } from "./Key/KHInputKeyOr";
import { KHInputProvider } from "./KHInputProvider";
import { KHPadInput, KHPadAxis } from "./KHInputProviderController";
import { KHMouseInput } from "./KHInputProviderMouse";
import { KHInputScene } from "./KHInputScene";
import { KHInputSet } from "./KHInputSet";

export class KHUnifiedInput {
    inputName: string;
    inputKey: KHInputKey;

    static UnifiedInput(inputSet: KHInputSet, keys: any[] = [], buttons: KHPadInput[] = [], mouseInputs: KHMouseInput[] = [], condtional: KHReference<boolean> = null, invert: boolean = false): KHInputKey {
        let inputs: KHInputKey[] = [];
        inputs.push(...this.GetKeyboardInputs(keys));
        inputs.push(...this.GetControllerInputs(buttons));
        inputs.push(...this.GetMouseInputs(mouseInputs));
        
        let combinedInput = this.GetCombinedInput(inputSet, inputs);
        if (condtional == null) {
            return combinedInput;
        }
        return new KHInputKeyConditional(inputSet, this.GetCombinedInput(inputSet, inputs), condtional, invert);
    }

    static GetKeyboardInputs(keys: any[] = []) {
        const keyboard = KHInputScene.SharedInput.keyboardProvider;
        let inputs: KHInputKey[] = [];
        for (let i = 0; i < keys.length; i++) {
                inputs.push(keyboard.getInput(keys[i]));
        }
        return inputs;
    }

    static GetControllerInputs(buttons: KHPadInput[] = []) {
        const gamepad = KHInputScene.SharedInput.controllerProviders;
        let inputs: KHInputKey[] = [];
        for (let i = 0; i < buttons.length; i++) {
            for (let j = 0; j < gamepad.length; j++) {
                inputs.push(gamepad[j].getInput(buttons[i]));
            }
        }
        return inputs;
    }

    static GetControllerAxesScaledRadial(inputSet: KHInputSet, primary: KHPadAxis, secondary: KHPadAxis, deadZone: number): KHInputAxis[] {
        const gamepad = KHInputScene.SharedInput.controllerProviders;
        let axes: KHInputAxis[] = [];
        for (let j = 0; j < gamepad.length; j++) {
            axes.push(new KHInputAxisDeadZoneScaledRadial(inputSet, deadZone, gamepad[j].getAxis(primary), gamepad[j].getAxis(secondary)));
        }
        return axes;
    }

    static GetControllerAxesScaledAxial(inputSet: KHInputSet, primary: KHPadAxis, deadZone: number): KHInputAxis[] {
        const gamepad = KHInputScene.SharedInput.controllerProviders;
        let axes: KHInputAxis[] = [];
        for (let j = 0; j < 1; j++) {
            axes.push(new KHInputAxisDeadZoneScaledAxial(inputSet, deadZone, gamepad[j].getAxis(primary)));
        }
        return axes;
    }

    static GetMouseInputs(mouseInputs: KHMouseInput[] = []) {
        const mouse = KHInputScene.SharedInput.mouseProvider;
        let inputs: KHInputKey[] = [];
        for (let i = 0; i < mouseInputs.length; i++) {
            inputs.push(mouse.getInput(mouseInputs[i]));
        }
        return inputs;
    }

    static GetCombinedInput(inputSet: KHInputSet, inputs: KHInputKey[] = [], retriggerOnEveryJustDown: boolean = false) {
        return inputs.length == 1 ? inputs[0] : new KHInputKeyOr(inputSet, inputs, retriggerOnEveryJustDown);
    }

    static GetCombinedAxis(inputSet: KHInputSet, axes: KHInputAxis[] = []) {
        return axes.length == 1 ? axes[0] : new KHInputAxisHighestMagnitude(inputSet, axes);
    }
 }