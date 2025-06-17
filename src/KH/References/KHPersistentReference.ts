import { KHLocalStorageElement, KHLocalStorageManager } from "../KHLocalStorageManager";
import { KHReference } from "./KHReference";

/**
 * Variable reference that saves values to json. If the value being saved is one
 * other than number, boolean, json, or string, an overridden class should be 
 * added that supports serializing and deserializing.
 * 
 * It will only persist if the options parameter is set.
 */
export class KHPersistentReference<T> extends KHReference<T> implements KHLocalStorageElement {
    private manager: KHLocalStorageManager;
    private readonly saveOnChange: boolean;
    private readonly defaultValue: T;
    
    constructor(defaultValue: T, saveOnChange: boolean = true) {
        super(defaultValue);
        this.saveOnChange = saveOnChange;
        this.defaultValue = defaultValue;
        this.value = this.defaultValue;
    }

    toJSON() {
        return this.value;
    }

    fromJSON(json: any): void {
        let value = json;
        // Bypass this class's set to avoid a save loop.
        super.set(value);
    }

    setManager(manager: KHLocalStorageManager) {
        this.manager = manager;
    }

    set(value: T) {
        super.set(value);
        if (this.saveOnChange) {
            this.save();
        }
    }

    /**
     * Triggers a save on its owning manager, if present. Useful if you're 
     * altering the internals of a JSON object.
     */
    save() {
        this.manager?.save(this);
    }
}