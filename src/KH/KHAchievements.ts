import { KHLocalStorageElement, KHLocalStorageManager } from "./KHLocalStorageManager";

/**
 * Simple class for persisting achievement state.
 */
export default class KHAchievements implements KHLocalStorageElement {
    private manager: KHLocalStorageManager;
    private achievementMap: Map<string, boolean> = new Map();
    private dirty: boolean;

    public static readonly MENAGERIE_KEY = 'kh.menagerie.achievements';

    toJSON() {
        return Object.fromEntries(this.achievementMap);
    }

    fromJSON(json: any): void {
        for (const [key, value] of Object.entries(json)) {
            if (typeof value === 'boolean' && value) {
                this.achievementMap.set(key, value);
            } else {
                console.log(`Unexpected value in achievement map for key ${key}`, value);
            }
        }
    }
    setManager(manager: KHLocalStorageManager) {
        this.manager = manager;
    }

    /**
     * Unlocks achievement and returns whether or not the achievement has
     * already been unlocked. Also saves unless the save parameter is false or
     * the achievement has already been unlocked.
     */
    unlock(key: string, save: boolean = true): boolean {
        if (this.achievementMap.has(key) && this.achievementMap.get(key)) {
            return false;
        }
        console.log(`Unlocked ${key}`);
        this.achievementMap.set(key, true);
        this.dirty = true;
        if (save) this.save();
    }

    lock(key: string, save: boolean = true) {
        if (this.achievementMap.delete(key)) {
            this.dirty = true;
            if (save) this.save();
        }
    }

    save() {
        if (this.dirty) {
            this.manager.save(this);
            this.dirty = false;
        }
    }
}