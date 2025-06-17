import { KHLocalStorageManager } from "./KHLocalStorageManager";

export enum KHScaleMode {
    ScaleMax,
    ScalePixelPerfect,
    NoScale
}

export type KHGameConfig = {
    scaleMode: KHScaleMode,
    alwaysMaxScale?: boolean,
    defaultScale?: number,
    minScale?: number,
    maxScale?: number,
}

export class KHGame extends Phaser.Game {
    readonly width: number;
    readonly height: number;

    private parentElement: HTMLElement;
    private khConfig: KHGameConfig;
    private scaleFactor: number;
    storageManager: KHLocalStorageManager;

    private setKHConfig(config: KHGameConfig) {
        config.alwaysMaxScale = config.alwaysMaxScale || !config.defaultScale;
        config.defaultScale = config.defaultScale || 1;
        config.maxScale = config.maxScale || Infinity;
        config.minScale = config.minScale || 1;
        this.khConfig = config;
    }

    constructor(phaserConfig: Phaser.Types.Core.GameConfig, khConfig: KHGameConfig) {
        super(phaserConfig);
        this.storageManager = new KHLocalStorageManager();
        this.width = Number(this.config.width);
        this.height = Number(this.config.height);
        this.setKHConfig(khConfig);

        this.events.on(Phaser.Core.Events.READY, () => {
            if (this.config.parent instanceof HTMLElement) {
                this.parentElement = this.config.parent.parentElement;
            } else if (typeof this.config.parent === 'string') {
                this.parentElement = document.getElementById(this.config.parent)?.parentElement;
            }
            this.updateKHScale();
        })

        window.addEventListener('resize', e => {
            this.updateKHScale();
        })
    }

    private updateKHScale() {
        if (this.khConfig.scaleMode == KHScaleMode.NoScale) return;
        if (!this.khConfig.alwaysMaxScale) return;
        if (this.parentElement == null) {
            console.warn("Null parent element.");
        }

        let scale = this.maxScale();

        // If it's not always default, resize should only trigger update if the window
        // size has made the content no longer fit.
        if (!this.khConfig.alwaysMaxScale && scale >= this.scaleFactor) {
            return;
        }
        
        this.setScale(this.khConfig.maxScale);
    }

    private maxScale() {
        if (this.parentElement == null) return 1;
    
        const maxWidthScale = this.parentElement.offsetWidth / this.scale.gameSize.width;
        const maxHeightScale = this.parentElement.offsetHeight / this.scale.gameSize.height;
        
        let scale = Math.min(maxWidthScale, maxHeightScale);
        
        switch (this.khConfig.scaleMode) {
            case KHScaleMode.ScalePixelPerfect: scale = (Math.floor(scale)); break;
        }
        
        return scale;
    }

    setScale(scale: number) {
        scale = Math.max(this.khConfig.minScale, Math.min(this.khConfig.maxScale, scale));
        scale = Math.min(this.maxScale(), scale);
        this.scaleFactor = Math.max(this.khConfig.minScale, Math.min(this.khConfig.maxScale, scale));
        
        this.scale.setZoom(this.scaleFactor);
        this.canvas.style.width = `${this.width * this.scaleFactor}px`;
        this.canvas.style.height = `${this.height * this.scaleFactor}px`;
    }

    getScale(): number { 
        return this.scaleFactor;
    }

    increaseScale(amt: number = 1) {
        this.setScale(this.scaleFactor + amt);
    }

    decreaseScale(amt: number = 1) {
        this.setScale(this.scaleFactor - amt);
    }
}