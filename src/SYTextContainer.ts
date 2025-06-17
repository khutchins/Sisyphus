import { game } from "./Game";
import { KHContainer } from "./KH/KHContainer";

export default class SYTextContainer extends KHContainer {
    texts: Phaser.GameObjects.DynamicBitmapText[];
    
    constructor(scene: Phaser.Scene, private readonly rows: number, private readonly cols: number) {
        super(scene, 0, 0, game.width, game.height);

        this.texts = [];
        for (let y = 0; y < rows; y++) {
            const text = scene.add.dynamicBitmapText(4, 33 * (rows - 1 - y), 'font', '', 32).setTint(0x0);
            this.texts.push(text);
            this.add(text);
        }
    }

    setText(text: string) {
        const modText = text + 'o';
        for (let i = 0; i < this.texts.length; i++) {
            let sliced = modText.slice(i * this.cols, (i + 1) * this.cols).padEnd(this.cols, ' ');
            if (i % 2 == 1) sliced = [...sliced].reverse().join('');
            this.texts[i].text = sliced;
        }
    }
}