import { KHLocalStorageElement, KHLocalStorageManager } from "./KHLocalStorageManager";
import { KHLocalStorageWrapper } from "./KHLocalStorageWrapper";

/**
 * Creates a high score list with the given ScoreInfo type.
 * NOTE: ScoreInfo must be serializable to JSON using JSON.stringify.
 */
export default class KHHighScores<ScoreInfo> implements KHLocalStorageElement {
    private manager: KHLocalStorageManager;
    private scores: { name: string, score: ScoreInfo}[];
    private readonly comparator: (item1: ScoreInfo, item2: ScoreInfo) => number;
    private readonly maxItems: number;
    private readonly defaultScores: {name: string, score:ScoreInfo}[];

    public static NumberDescendingComparator = (a: number, b: number) => b - a;
    public static NumberAscendingComparator = (a: number, b: number) => a - b;

    public constructor(comparator: (item1: ScoreInfo, item2: ScoreInfo) => number, maxItems: number, defaultScores: {name: string, score:ScoreInfo}[]) {
        this.comparator = comparator;
        this.maxItems = maxItems;
        this.scores = defaultScores;
        this.defaultScores = [...defaultScores];
    }

    setManager(manager: KHLocalStorageManager) {
        this.manager = manager;
    }

    toJSON() {
        return this.scores;
    }

    fromJSON(json: any): void {
        this.scores = json;
        if (!Array.isArray(this.scores)) {
            this.scores = [...this.defaultScores];
        }
        this.sort(this.scores);
    }

    private sort(scores: {name: string, score:ScoreInfo}[]) {
        scores.sort((a, b) => this.comparator(a.score, b.score));
    }

    public clear() {
        this.scores = [];
    }

    /**
     * Gets the high scores. Modifying this WILL modify
     * the high score table. Changes to this must be registered
     * using save or they will not be persisted.
     */
    public get(): {name: string, score: ScoreInfo}[] {
        return this.scores;
    }

    /**
     * Adds a score to the list, trimming the list if that would
     * bring it above the max items.
     * @param name Name to attach to the score.
     * @param score The score itself.
     * @param saveAfter Whether the high scores should be saved after writing.
     */
    public addScore(name: string, score: ScoreInfo, saveAfter: boolean = true) {
        this.scores.push({name, score});
        this.sort(this.scores);
        this.scores.length = Math.min(this.maxItems, this.scores.length);
        if (saveAfter) this.save();
    }

    /**
     * Returns the rank that the given score would get if
     * it was added to the list. Does not modify the list
     * itself.
     */
    public newScoreRank(score: ScoreInfo): number {
        let scoreCopy = [...this.scores];
        const val = {name: '', score};
        scoreCopy.push(val);
        this.sort(scoreCopy);
        return scoreCopy.indexOf(val);
    }

    /**
     * Determines whether or not the passed score would
     * appear in the high score list.
     */
    public wouldBeHighScore(score: ScoreInfo): boolean {
        return this.newScoreRank(score) < this.maxItems;
    }

    public save() {
        this.manager.save(this);
    }
}