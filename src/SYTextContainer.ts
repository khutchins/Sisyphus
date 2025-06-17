import { game } from "./Game";
import { KHContainer } from "./KH/KHContainer";
import { KHEventHandler, KHEventMap } from "./KH/KHEventHandler";
import { lerpColor, percentClamped } from "./KH/KHHelperFunctions";

interface SYTextContainerEventMap extends KHEventMap {
    'heightChanged': { height: number };
    'interactionAllowed': { allowed: boolean };
}

const QUICK_ANIM_FADE = 16 / 3;

export default class SYTextContainer extends KHContainer {
    texts: Phaser.GameObjects.DynamicBitmapText[];
    emitter: KHEventHandler<SYTextContainerEventMap> = new KHEventHandler();
    private textHeight = 0;
    private cachedText: string = '';
    private activeFade: Phaser.GameObjects.DynamicBitmapText;
    
    constructor(scene: Phaser.Scene, private readonly rows: number, private readonly cols: number) {
        super(scene, 0, 0, game.width, game.height);

        this.texts = [];
        for (let y = 0; y < rows; y++) {
            const text = scene.add.dynamicBitmapText(4, 33 * (rows - 1 - y), 'font', '', 32).setTint(0x0);
            this.texts.push(text);
            this.add(text);
        }
        this.textHeight = 0;
    }

    setText(text: string) {
        this.cachedText = text;
        const modText = text + 'o';
        let thisHeight = 0;
        for (let i = 0; i < this.texts.length; i++) {
            const raw = modText.slice(i * this.cols, (i + 1) * this.cols);
            if (raw.length > 0) thisHeight = i;
            let sliced = raw.padEnd(this.cols, ' ');
            if (i % 2 == 1) sliced = [...sliced].reverse().join('');
            this.texts[i].text = sliced;
        }
        if (thisHeight !== this.textHeight) {
            this.textHeight = thisHeight;
            this.emitter.emitEvent('heightChanged', { height: this.textHeight });
        }
    }

    startFade(duration: number, fadeCallback: (empty: boolean, index: number) => void, fadeIndex: number = 0) {
        this.hideLastCharacter(duration, (empty: boolean) => {
            fadeCallback?.(empty, fadeIndex);
        }, 0);
    }

    cancelFade() {
        this.activeFade?.setDisplayCallback(undefined);
        this.activeFade = undefined;
    }

    modifiedIndexForRow(row: number, index: number) {
        if (row % 2 !== 1) return index;
        return this.cols - 1 - index;
    }

    doLoss() {
        this.emitter.emitEvent('interactionAllowed', { allowed: false });
        this.doLossInternal();
    }

    private hideLastCharacter(duration: number, callback: (empty: boolean, overage: number) => void, overage: number) {
        if (this.cachedText.length === 0) {
            callback(true, 0);
            return;
        }
        
        const idx = this.cachedText.length - 1;
        if (idx >= 0) {
            const rowNum = Math.floor(idx / this.cols);
            const indexInRow = this.modifiedIndexForRow(rowNum, Math.floor(idx % this.cols));
            const currRow = this.texts[rowNum];
            if (!currRow) {
                console.warn('row num out of bounds', rowNum);
                callback(true, 0);
                return;
            }
            if (duration - overage <= 0) {
                this.setText(this.cachedText.slice(0, -1));
                callback(false, overage - duration);
                return;
            }
            const startTime = this.scene.time.now;
            const endTime = startTime + duration;
            currRow.setDisplayCallback((data: Phaser.Types.GameObjects.BitmapText.DisplayCallbackConfig) => {
                const percent = percentClamped(startTime, endTime, this.scene.time.now);
                const color = data.index === indexInRow ? lerpColor(0, 0xFFFFFF, percent) : 0x0;
                data.tint.bottomLeft = color;
                data.tint.bottomRight = color;
                data.tint.topLeft = color;
                data.tint.topRight = color;
                if (data.index === indexInRow && percent >= 1) {
                    this.setText(this.cachedText.slice(0, -1));
                    currRow.setDisplayCallback(undefined);
                    callback(false, this.scene.time.now - endTime);
                    return data;
                }
                return data;
            });
        }
    }
    
    private doLossInternal(overage: number = 0) {
        this.hideLastCharacter(QUICK_ANIM_FADE, (empty: boolean, overage: number) => {
            if (this.cachedText.length === 0) {
                this.emitter.emitEvent('interactionAllowed', { allowed: true });
            } else {
                this.doLossInternal(overage);
            }
        }, overage);
    }
}