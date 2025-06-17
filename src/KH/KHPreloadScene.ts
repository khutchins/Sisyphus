import { KHContainer } from "./KHContainer";
import * as WebFont from "webfontloader";

export class KHPreloadScene extends Phaser.Scene {
    game_width: number;
    game_height: number;
    loadBarContainer: KHContainer;
    loadBar: Phaser.GameObjects.Graphics;
    cachedPalette: [number, number, number];
    current_percent: number = 0;

    constructor(key: string = "KHPreloadScene") {
        super(key);
    }

    preload() {
        this.cachedPalette = this.palette();
        this.game_width = Number(this.game.config.width);
        this.game_height = Number(this.game.config.height);
        const size = this.loadBarSize(this.game_width, this.game_height);
        const width = size[0];
        const height = size[1];
        const containerWidth = Math.floor((this.game_width - width) / 2);
        const containerHeight = Math.floor((this.game_height - height) / 2);
        this.loadBarContainer = new KHContainer(this, containerWidth, containerHeight, width, height, this.cachedPalette[1], 1, 0, false);
        this.add.existing(this.loadBarContainer);
        this.loadBar = this.add.graphics();
        this.loadBarContainer.add(this.loadBar);
        this.cameras.main.setBackgroundColor(this.cachedPalette[0]);

        this.load.on('progress', (value) => {
            this.setProgress(value);
        });

        this.loadAssets();
    }

    create() {
        this.setProgress(1);
        const fonts = this.fontsToLoad();
        if (fonts == null || fonts.length == 0) {
            this.startScene();
        } else {
            WebFont.load({
                custom: {
                    families: fonts
                },
                active: () => {
                    this.startScene();
                }
            });
        }
        
    }

    setProgress(percent: number): void {
        percent = Math.max(this.current_percent, Math.min(percent, 1));
        const inset = Math.floor(this.loadBarContainer.c_h * .1);
        this.loadBar.clear();
        this.loadBar.fillStyle(this.cachedPalette[2]);
        const w = this.loadBarContainer.c_w - inset * 2, h = this.loadBarContainer.c_h - (inset * 2);
        this.loadBar.fillRect(inset, inset, Math.floor(percent * w), h);
        const logo = [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [1, 1, 1, 1],
            [0, 1, 0, 1],
            [1, 0, 0, 1],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
        ];
        this.drawBoxArray(this.loadBar, this.cachedPalette[1], logo, inset, inset, w, h);
    }

    drawBoxArray(graphics: Phaser.GameObjects.Graphics, col: number, arr: number[][], x: number, y: number, w: number, h: number): void {
        const boxes_width = arr[0].length;
        const boxes_height = arr.length;
        const box_width = h / boxes_height;
        const all_width = box_width * boxes_width;
        const s_x = (w - all_width) / 2 + x;
        graphics.fillStyle(col);
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr[i].length; j++) {
                if (arr[i][j]) {
                    graphics.fillRect(s_x + box_width * j, y + box_width * i, box_width, box_width);
                }
            }
        }
    }

    /**
     * Size of the loading bar. Default is based on the size of the screen.
     * @param width Width of the screen.
     * @param height Height of the screen.
     * @returns [width, height]
     */
    loadBarSize(width: number, height: number): [number, number] {
        // The flooring and multiplying ensure that everything looks crisp with
        // my logo at all resolutions by default (hopefully). It's ensured to be
        // a multiple of 10 for the 8 vertical pixels of my logo + the two for inset.
        return [ Math.floor(width / 2), Math.floor(Math.max(1, Math.floor(height / 5) / 10)) * 10 ];
    }

    startScene(): void {
        this.preloadFinished();
        this.scene.start(this.nextScene(), null);
    }

    preloadFinished(): void {
        // Override and do anything you want to do before first proper scene runs.
    }

    nextScene(): string {
        return "";
        // Override and return scene name.
    }

    loadAssets(): void {
        // Override and load assets.
    }

    fontsToLoad(): string[] {
        // Override and return font names, if any.
        return [];
    }

    /**
     * Color palette for the loading scene. [BG color, load bar color, logo color]
     */
    palette(): [number, number, number] {
        return [ 0x000000, 0x111111, 0x7d007e ];
    }
}