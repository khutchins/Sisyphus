export interface KHLocalStorageElement {
    toJSON(): any;
    fromJSON(json: any): void;
    setManager(manager: KHLocalStorageManager): void;
}

type KHLocalStorageRegistrationElement = KHLocalStorageElement | { [key: string] : KHLocalStorageRegistrationElement };

/**
 * Coordinates multiple classes holding storage access
 * to local storage, catching any exceptions that are
 * thrown.
 */
export class KHLocalStorageManager {
    private storageAccessDenied: boolean;
    private registrar: object;
    private pathSeparator: string;
    private rootKeyMap: Map<KHLocalStorageElement, string> = new Map();
    private inLoad: boolean;
    private deferredSaves: Set<string> = new Set();

    constructor(pathSeparator = '.') {
        this.pathSeparator = pathSeparator;
        this.registrar = {};
    }

    private resolvePath(path: string): string[] {
        return path.split(this.pathSeparator);
    }

    registerAll(registrationObject: KHLocalStorageRegistrationElement) {
        this.inLoad = true;
        this.registerIn(undefined, '', this.registrar, registrationObject);
        this.loadAll(Object.keys(registrationObject).map(x => x.split(this.pathSeparator)[0]));
    }
    
    private isPlainObject(thing: any): boolean {
        const prototype = Object.getPrototypeOf(thing);
        return prototype === null || prototype.constructor === Object;
    }

    private isStorageElement(thing: any): thing is KHLocalStorageElement {
        return thing && thing.toJSON && thing.fromJSON;
    }

    private registerIn(rootKey: string | undefined, path: string, registrar: object, registree: object) {
        for (const [key, value] of Object.entries(registree)) {
            const basePath = path ? `${path}${this.pathSeparator}` : '';

            // Expand path if it contains a separator.
            if (key.includes(this.pathSeparator)) {
                const elements = key.split(this.pathSeparator);
                const baseKey = elements[0];
                const rest = elements.slice(1).join(this.pathSeparator);
                let root = rootKey ?? baseKey;
                if (!registrar.hasOwnProperty(baseKey)) registrar[baseKey] = {};
                this.registerIn(root, `${basePath}${baseKey}`, registrar[baseKey], { [rest]: value})
                continue;
            }
            
            let root = rootKey ?? key;
            const fullPath = `${basePath}${key}`;
            if (!this.isPlainObject(value) && !this.isStorageElement(value) && !Array.isArray(value)) {
                console.warn(`Unsupported element at path ${fullPath}. Skipping.`, value);
                continue;
            } 
            else if (registrar.hasOwnProperty(key)) {
                if (this.isStorageElement(value)) {
                    console.warn(`Entity already exists at path ${fullPath}. Skipping. (Registrar, element)`, registrar, value)
                    continue;
                }
                this.registerIn(root, fullPath, registrar[key], value);
            } else {
                if (this.isStorageElement(value)) {
                    this.rootKeyMap.set(value, rootKey);
                    value.setManager(this);
                    registrar[key] = value;
                } else {
                    registrar[key] = {};
                    this.registerIn(root, fullPath, registrar[key], value);
                }
            }
        }
    }

    register(path: string, element: KHLocalStorageElement) {
        if (!path) {
            console.warn(`Invalid path '${path}', element will not be registered`);
            return;
        }
        const resolvedPath = this.resolvePath(path);

        const registrationObject = {};
        let curr = registrationObject;
        for (let i = 0; i < resolvedPath.length - 1; i++) {
            let currPath = resolvedPath[i];
            curr[currPath] = {};
            curr = curr[currPath];
        }
        curr[resolvedPath[resolvedPath.length - 1]] = element;
        this.registerAll(registrationObject);
    }

    save(element: KHLocalStorageElement | string) {
        if (this.isStorageElement(element)) {
            if (!this.rootKeyMap.has(element)) {
                console.warn(`Manager does not have element ${element}. It will not be saved.`)
                return;
            }
            this.saveInternal(this.rootKeyMap.get(element));
        } else if (typeof element === 'string') {
            this.saveInternal(element);
        }
    }

    private saveInternal(key: string) {
        if (this.inLoad) {
            this.deferredSaves.add(key);
            console.log('Triggered save while initializing. Deferring save until load finishes to avoid stomping on save with uninitialized values.');
            return;
        }
        let base = this.registrar[key];
        if (!base) {
            console.warn(`Attempting to save for key ${key} but no entities were registered under it. Ignoring.`);
            return;
        }
        let json;
        if (this.isStorageElement(base)) {
            json = base.toJSON();
        } else {
            json = this.loadFromLocalStorage(key) ?? {};
            this.overrideWithElementValues(json, base);
        }
        this.saveToLocalStorage(key, json);
    }

    private overrideWithElementValues(objToOverride: object, registrar: object | KHLocalStorageElement): any {
        for (const [key, value] of Object.entries(registrar)) {
            if (this.isStorageElement(value)) {
                objToOverride[key] = value.toJSON();
            } else {
                if (!objToOverride.hasOwnProperty(key)) objToOverride[key] = {};
                this.overrideWithElementValues(objToOverride[key], registrar[key]);
            }
        }
    }
    
    loadAll(keys?: string[]) {
        this.inLoad = true;
        if (!keys) {
            keys = Object.keys(this.registrar);
        }
        // Remove duplicate keys;
        keys = keys.filter((item, idx) => keys.indexOf(item) === idx);
        for (const key of keys) {
            this.loadInternal(key);
        }
        this.inLoad = false;
        if (this.deferredSaves.size > 0) {
            console.log('Performing deferred saves.');
            for (const key of this.deferredSaves.keys()) {
                this.save(key);
            }
            this.deferredSaves.clear();
        }
    }

    load(element: KHLocalStorageElement | string) {
        if (this.isStorageElement(element)) {
            if (!this.rootKeyMap.has(element)) {
                console.warn(`Manager does not have element ${element}. It will not be loaded.`)
                return;
            }
            this.loadAll([this.rootKeyMap.get(element)]);
        } else if (typeof element === 'string') {
            this.loadAll([element]);
        }
    }

    private loadInternal(key: string) {
        let base = this.registrar[key];
        if (!base) {
            console.warn(`Attempting to save for key ${key} but no entities were registered under it. Ignoring.`);
            return;
        }
        let json = this.loadFromLocalStorage(key);
        if (this.isStorageElement(base)) {
            base.fromJSON(json);
        } else {
            this.overrideFromJSON(json, base);
        }
    }

    private overrideFromJSON(json: object, registrar: object | KHLocalStorageElement): any {
        // If there's no values to load, don't try.
        if (!json) return;
        for (const [key, value] of Object.entries(registrar)) {
            if (this.isStorageElement(value)) {
                value.fromJSON(json[key]);
            } else {
                this.overrideFromJSON(json[key], registrar[key]);
            }
        }
    }

    private loadFromLocalStorage(key: string): any {
        let jsonStr = "";
        this.storageAccessDenied = false;
        try {
            jsonStr = localStorage.getItem(key);
        } catch (e) {
            console.warn("Unable to read from local storage. Persistent storage will not work.", e)
            this.storageAccessDenied = true;
        }
        try {
            const json = JSON.parse(jsonStr);
            return json ?? undefined;
        }
        catch (e) {
            console.warn("Error parsing options: " + jsonStr);
            return undefined;
        }
    }

    wasStorageAccessDenied() {
        return this.storageAccessDenied;
    }

    /**
     * Attempts to save a JSON object to local storage.
     * @param json JSON object to save
     * @returns Whether or not the state saved successfully.
     */
    private saveToLocalStorage(key: string, json: any): boolean {
        try {
            localStorage.setItem(key, JSON.stringify(json));
            return true;
        } catch (e) {
            console.warn("Failed to save content.");
            return false;
        }
    }
}