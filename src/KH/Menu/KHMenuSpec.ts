import { KHEventHandler, KHEventMap } from "../KHEventHandler";
import { inRange } from "../KHHelperFunctions";
import { KHMenuOption } from "./KHMenuOption";

interface KHMenuSpecEventMap extends KHEventMap {
    /** Update selection */
    "us": { userInitiated: boolean, index: number, lastIndex: number, option: KHMenuOption, lastOption: KHMenuOption};
    /** Update selection option */
    "uso": { userInitiated: boolean, option: KHMenuOption, selectionIndex: number };
    /** Update description */
    "ud": { description: string };
}

export class KHMenuSpec extends KHEventHandler<KHMenuSpecEventMap> {
    readonly title: string;
    private allOptions: KHMenuOption[] = [];
    private options: KHMenuOption[] = [];
    private lastOption: KHMenuOption | null;
    private selectedIndex: number = -1;

    constructor(title: string, menuEntries: KHMenuOption[], lastEntry: KHMenuOption = null) {
        super()
        this.title = title;
        this.options.push(...menuEntries);
        this.allOptions.push(...this.options);
        if (lastEntry) {
            this.allOptions.push(lastEntry);
            this.lastOption = lastEntry;
        }
        this.allOptions.forEach(element => {
            element.registerCallback("uso", (data) => {
                this.sendUpdateDescriptionEvent(this.allOptions[this.selectedIndex]);
                this.emitEvent("uso", { userInitiated: data.userInitiated, option: data.option, selectionIndex: data.selectionIndex });
            });
        });
        this.setNextIndex(false);
    }

    getDescription(): string {
        let current = this.allOptions[this.selectedIndex];
        if (current) {
            return current.getDescription();
        }
        return "";
    }

    setSelected(menuOption: KHMenuOption, userInitiated: boolean = true) {
        let newIndex = this.allOptions.indexOf(menuOption);
        this.setSelectedIndex(newIndex);
    }

    sendSelectPreviousToCurrentOption(): void {
        let option = this.allOptions[this.selectedIndex];
        if (option) {
            if (option.back_callback) {
                option.back_callback();
            }
        }
    }

    sendSelectNextToCurrentOption(): void {
        let option = this.allOptions[this.selectedIndex];
        if (option) {
            if (option.callback) {
                option.callback();
            }
        }
    }

    setPreviousIndex(userInitiated: boolean = true): void {
        for (let i = 1; i <= this.allOptions.length; i++) {
            const adj_idx = inRange(this.selectedIndex - i, this.allOptions.length);
            if (this.allOptions[adj_idx].getSelectable()) {
                this.setSelectedIndex(adj_idx, userInitiated);
                return;
            }
        }
    }

    setNextIndex(userInitiated: boolean = true): void {
        for (let i = 1; i <= this.allOptions.length; i++) {
            const adj_idx = inRange(this.selectedIndex + i, this.allOptions.length);
            if (this.allOptions[adj_idx].getSelectable()) {
                this.setSelectedIndex(adj_idx, userInitiated);
                return;
            }
        }
    }

    setSelectedIndex(index: number, userInitiated: boolean = true) {
        if (index < 0 || index >= this.allOptions.length) {
            index = -1;
        }
        let lastIndex = this.selectedIndex;
        let last = this.allOptions[this.selectedIndex];
        last?.setSelected(false);
        this.selectedIndex = index;
        let current = this.allOptions[this.selectedIndex];
        current?.setSelected(true);
        this.emitEvent("us", { index: this.selectedIndex, lastIndex: lastIndex, option: current, lastOption: last, userInitiated: userInitiated});
        this.sendUpdateDescriptionEvent(current);
    }

    private sendUpdateDescriptionEvent(current: KHMenuOption | null) {
        this.emitEvent("ud", { description: current?.getDescription() ?? "" });
    }

    /**
     * Returns a list of menu options. Changes to this list will not be 
     * reflected in the menu spec.
     */
    getOptions(): KHMenuOption[] {
        return [...this.options];
    }

    getLastOption(): KHMenuOption | null {
        return this.lastOption;
    }
}