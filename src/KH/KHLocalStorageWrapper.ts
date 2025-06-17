/**
 * Wraps access to local storage, catching any exceptions.
 */
export class KHLocalStorageWrapper {
    private readonly key: string;
    private storageAccessDenied: boolean;

    constructor(key: string) {
        this.key = key;
    }

    load(defaultValue: any = {}): any {
        let jsonStr = "";
        this.storageAccessDenied = false;
        try {
            jsonStr = localStorage.getItem(this.key);
        } catch (e) {
            console.warn("Unable to read from local storage. Persistent storage will not work.", e)
            this.storageAccessDenied = true;
        }
        try {
            const json = JSON.parse(jsonStr);
            return json ?? defaultValue;
        }
        catch (e) {
            console.warn("Error parsing options: " + jsonStr);
            return defaultValue;
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
    save(json: any): boolean {
        try {
            localStorage.setItem(this.key, JSON.stringify(json));
            return true;
        } catch (e) {
            console.warn("Failed to save content.");
            return false;
        }
    }

    clear(): boolean {
        try {
            localStorage.removeItem(this.key);
            return true;
        } catch (e) {
            console.log(`Failed to clear item ${this.key}`);
            return false;
        }
    }
}