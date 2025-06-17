import { SYMainScene } from "./SYMainScene";
import { SYPreloadScene } from "./SYPreloadScene";
import { KHPersistentReference } from "./KH/References/KHPersistentReference";
import { KHGame, KHGameConfig, KHScaleMode } from "./KH/KHGame";
import KHAchievements from "./KH/KHAchievements";

const config = {
    type: Phaser.AUTO,
    backgroundColor: "#FFFFFF",
    scale: {
        width: 960,
        height: 600,
    },
    input: {
        gamepad: true,
        mouse: {
            preventDefaultWheel: false
        },
    },
    parent: "phaser-game",
    dom: {
        createContainer: true
    },
    version: "1.0.0",
    scene: [ SYPreloadScene, SYMainScene ]
};

export enum ATAchievements {
    Win = "attention_win",
}

export class ATGame extends KHGame {
    width: number;
    height: number;
    score: KHPersistentReference<number>;
    scoreCalm: KHPersistentReference<number>;
    mute: KHPersistentReference<boolean>;
    inCalmMode: boolean;
    
    achievements: KHAchievements;

    constructor(config, khConfig: KHGameConfig) {
        super(config, khConfig);
        this.width = Number(this.config.width);
        this.height = Number(this.config.height);

        this.achievements = new KHAchievements();
        this.score = new KHPersistentReference<number>(0, true);
        this.scoreCalm = new KHPersistentReference<number>(0, true);
        this.mute = new KHPersistentReference<boolean>(false, true);

        this.storageManager.registerAll({
            [KHAchievements.MENAGERIE_KEY]: this.achievements
        });
    }
}

export const game = new ATGame(config, { scaleMode: KHScaleMode.NoScale, alwaysMaxScale: true });