import { inRange } from "../KHHelperFunctions";
import { KHMenuOption } from "./KHMenuOption";

export class KHMenuSelectOption extends KHMenuOption {
    selected_idx: number;
    descriptions: string[];
    values: string[];
    prefix: string;
    lockReason: string;
    menu_callback: (idx: number) => void;
    
    constructor(prefix: string, values: string[], descriptions: string[], callback: (idx: number) => void = null, idx = 0, extras: {} = {}) {
        if (descriptions.length != values.length) {
            throw "Descriptions length does not equal values length!";
        }

        prefix = prefix ? prefix.toUpperCase() : "";
        super(prefix + values[idx], descriptions[idx], true, () => {
            this.setSelectedIdx(inRange(this.selected_idx + 1, this.values.length));
        }, () => {
            this.setSelectedIdx(inRange(this.selected_idx - 1, this.values.length));
        }, extras);

        this.menu_callback = callback;
        
        this.values = values;
        this.prefix = prefix;
        this.descriptions = descriptions;
        this.selected_idx = idx;
    }

    static SingleDescription(text: string, description: string, options: string[], callback: (idx: number) => void = null, start_idx = 0) {
        let descriptions = [];
        for (let i = 0; i < options.length; i++) {
            descriptions.push(description);
        }
        return new KHMenuSelectOption(text, options, descriptions, callback, start_idx);
    }

    lockAt(idx: number, reason: string) {
        if (this.locked) return;
        this.lockReason = reason;
        this.setSelectedIdx(idx, true, false);
        this.locked = true;
    }

    setSelectedIdx(idx: number, allow_callback: boolean = true, userInitiated: boolean = true) {
        if (this.locked) return;

        this.selected_idx = idx;
        this.setText(this.prefix + this.values[this.selected_idx].toUpperCase());
        let descriptionText = this.descriptions[this.selected_idx].toUpperCase();
        if (this.lockReason) {
            descriptionText += ("\n\n(Locked by " + this.lockReason + ")").toUpperCase();
        }
        this.setDescription(descriptionText);
        this.setLocked(this.lockReason != null);
        if (this.menu_callback && allow_callback) {
            this.menu_callback(this.selected_idx);
        }
        this.emitEvent("uso", { userInitiated: userInitiated, option: this, selectionIndex: this.selected_idx });
    }
}
