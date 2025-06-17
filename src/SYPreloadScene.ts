import SYSceneNames from "./SYSceneNames";
import { KHPreloadScene } from "./KH/KHPreloadScene";

export class SYPreloadScene extends KHPreloadScene {
    constructor() {
        super(SYSceneNames.Preload);
    }

    nextScene() {
        return SYSceneNames.Menu;
    }

    palette(): [number, number, number] {
        return [ 0xFFFFFF, 0x0, 0xFFFFFF ];
    }

    loadAssets() {
        super.loadAssets();
        // rexinputtextplugin.min.js

        this.load.image('logo', 'assets/logo.png');
        this.load.bitmapFont('font', 'assets/RMono_0.png', 'assets/RMono.fnt');
    }
}