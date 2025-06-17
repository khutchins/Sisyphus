import { KHMenuSelectOption } from "./KHMenuSelectOption";

export class KHMenuSelectOptionWithValues extends KHMenuSelectOption {
    selected_object: any;
    valueObjects: any[];
    
    constructor(prefix: string, values: string[], valueObjects: any[], descriptions: string[], callback: (obj: any) => void = null, idx = 0, extras: {} = {}) {
        if (valueObjects.length != values.length) {
            throw "Value objects length does not equal values length!";
        }
        super(prefix, values, descriptions, (idx: number) => {
            this.selected_object = valueObjects[idx];
            if (callback) {
                callback(this.selected_object);
            }
        }, idx, extras);

        this.valueObjects = valueObjects;
        this.selected_object = valueObjects[idx];
    }

    setToValue(value: any) {
        const idx = this.valueObjects.indexOf(value);
        if (idx > 0) {
            this.setSelectedIdx(idx);
        } else {
            console.log("Couldn't not set to value " + value + ". Not found in value array.");
        }
    }
}
