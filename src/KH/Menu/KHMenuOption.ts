import { KHEventHandler, KHEventMap } from "../KHEventHandler";

interface KHMenuOptionEventMap extends KHEventMap {
    /** Update selectable */
    "us": { selectable: boolean };
    /** Update selection option */
    "uso": { userInitiated: boolean, option: KHMenuOption, selectionIndex: number };
    /** Update description */
    "ud": { text: string };
    /** Update locked */
    "ul": { locked: boolean };
    /** Update text */
    "ut": { text: string };
    /** Update selected */
    "update_selected": { selected: boolean };
}

export class KHMenuOption extends KHEventHandler<KHMenuOptionEventMap> {
    private text: string;
    private description: string;
    private selectable: boolean;
    private selected: boolean;
    protected locked: boolean = false;
    callback: () => void;
    back_callback: () => void;
    idx: number;
    readonly extras: {};
    
    constructor(text: string, description: string, selectable: boolean = false, callback: () => void = null, back_callback: () => void = null, extras: {} = {}) {
        super();
        this.text = text ?? "";
        this.description = description ?? "";
        this.selectable = selectable;
        this.callback = callback;
        this.back_callback = back_callback;
        this.idx = -1;
        this.extras = extras;
    }

    static JustText(text: string, extras: {} = null) {
        return new KHMenuOption(text, null, null, null, null, extras);
    }

    static Spacer() {
        return KHMenuOption.JustText("");
    }

    getSelectable(): boolean {
        return this.selectable;
    }

    setSelectable(selectable: boolean) {
        this.selectable = selectable;
        this.emitEvent("us", { selectable: selectable });
    }

    getSelected(): boolean {
        return this.selected;
    }

    setSelected(selected: boolean) {
        this.selected = selected;
        this.emitEvent("update_selected", { selected: selected });
    }

    getText(): string {
        return this.text;
    }

    setText(text: string) {
        this.text = text;
        this.emitEvent("ut", { text: text });
    }

    getDescription(): string {
        return this.description;
    }

    setDescription(text: string) {
        this.description = text;
        this.emitEvent("ud", { text: text });
    }

    getLocked(): boolean {
        return this.locked;
    }

    setLocked(locked: boolean): void {
        this.locked = locked;
        this.emitEvent("ul", { locked: locked });
    }
}
