import SYSceneNames from "./SYSceneNames";
import { game } from "./Game";
import { KHContainer } from "./KH/KHContainer";
import { getRandom, getRandomInt } from "./KH/KHHelperFunctions";
import { KHRandomSeedable } from "./KH/KHRandom";
import SYTextContainer from "./SYTextContainer";

function getFullText(seed: number, length: number): string {
    const chars = ['1', '2', '3', '4']
    const rand = new KHRandomSeedable(seed);
    let text = '';
    for (let i = 0; i < length; i++) {
        text += chars[rand.nextInt(0, 4)];
    }
    return text;
}

const keyMap = {
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '1',
    '6': '2',
    '7': '3',
    '8': '4',
    '9': '1',
    '0': '2',
    'Q': '1',
    'W': '2',
    'E': '3',
    'R': '4',
    'T': '1',
    'Y': '2',
    'U': '3',
    'I': '4',
    'P': '2',
    'A': '3',
    'S': '4',
    'D': '1',
    'F': '2',
    'G': '3',
    'H': '4',
    'J': '1',
    'K': '2',
    'L': '3',
    'Z': '4',
    'X': '1',
    'C': '2',
    'V': '3',
    'B': '4',
    'N': '1',
    'M': '2',
}

const WIDTH = 50;
// const WIDTH = 1;
// const HEIGHT = 18;
const HEIGHT = 18;

const FADE_TIMES = [5000, 4000, 3000, 2000, 1000, 500, 250, 125, 64, 32, 16];

export class SYMainScene extends Phaser.Scene {
    bg: KHContainer;
    mute: Phaser.GameObjects.Sprite;
    title: Phaser.GameObjects.DOMElement;
    highScore: Phaser.GameObjects.DOMElement;
    private fullString: string = '';
    private currString: string = '';
    private allowInteraction: boolean = true;

    constructor() {
        super(SYSceneNames.Menu);
    }

    init() {
    }

    validChar(char: string): boolean {
        return keyMap.hasOwnProperty(char);
    }

    matchesNext(char: string): boolean {
        const mappedKey = keyMap[char.toUpperCase()];
        return this.fullString[this.currString.length] === mappedKey;
    }

    create() {
        let seed = game.seed.get();
        console.log('seed is ', seed);
        if (seed === undefined || seed < 0) {
            console.log('creating new seed');
            game.seed.set(getRandomInt(0, 1_000_000_000));
            seed = game.seed.get();
        }
        const fakeString = getFullText(getRandomInt(0, 5_000_000), HEIGHT * WIDTH - 1);
        this.fullString = getFullText(seed, HEIGHT * WIDTH);
        console.log(this.fullString);

        const logo = this.add.image(game.width/2, game.height * 0.25, 'logo').setOrigin(0.5, 0.5);

        const fadeStartHeight = 8;
        const fadeEndHeight = 11;

        const textContainer = new SYTextContainer(this, HEIGHT, WIDTH);
        textContainer.emitter.onFor('heightChanged', this, ({height}) => {
            const percent = 1 - Math.min(1, Math.max(0, (height - fadeStartHeight) / (fadeEndHeight - fadeStartHeight)));
            logo.setAlpha(percent);
        });
        textContainer.emitter.onFor('interactionAllowed', this, ({allowed}) => {
            this.allowInteraction = allowed;
        });
        textContainer.setText(fakeString);
        textContainer.doLoss();

        const fadeCallback = (empty: boolean, idx: number) => {
            if (empty) return;
            textContainer.startFade(FADE_TIMES[Math.min(FADE_TIMES.length - 1, idx)], fadeCallback, idx + 1);
        }

        this.input.keyboard.on('keydown', (event: { key: string; }) => {
            if (!this.allowInteraction) return;
            textContainer.cancelFade();
            const char = event.key.toUpperCase();
            if (this.validChar(char) || char === 'O') { 
                if (this.matchesNext(char)) {
                    this.currString += char;
                    textContainer.setText(this.currString);
                    textContainer.startFade(FADE_TIMES[0], fadeCallback, 0);
                } else {
                    this.currString = '';
                    textContainer.doLoss();
                }
            }
        });
    }
}