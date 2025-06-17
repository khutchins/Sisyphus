export type SFXInfo<TAudioSFX> = {
    key: TAudioSFX,
    asset: SFXAsset | SFXAsset[],
}

export type SFXAsset = {
    loadKey: string,
    url: string,
    volume?: number,
}

export class SFXManager<TAudioSFX> {
    info: SFXInfo<TAudioSFX>;
    clips: Phaser.Sound.BaseSound[];

    constructor(scene: Phaser.Scene, info: SFXInfo<TAudioSFX>) {
        this.info = info;
        this.clips = [];
        
        const assets = Array.isArray(info.asset) ? info.asset : [info.asset];
        for (const asset of assets) {
            this.clips.push(scene.sound.add(info.key as string, { volume: asset.volume || 1 }));
        }
    }

    play() {
        if (this.clips.length === 0) return;
        if (this.clips.length === 1) {
            this.clips[0].play();
        } else {
            this.clips[Math.floor(Math.random() * this.clips.length)].play();
        }
    }
}

export class KHGenericAudioScene<TAudioSFX> extends Phaser.Scene {
    audio: any;
    fadeTween: Phaser.Tweens.Tween;
    current_clip: string;
    musicVolume = 1;
    sfxVolume = 1;
    trackVolume = 1;
    sfxMap: Map<TAudioSFX, SFXManager<TAudioSFX>>;

    constructor(name?: string) {
        super(name || "KHGenericAudioScene");
    }

    create() {
        this.sfxMap = new Map();
        const sfxClips = this.getSfxInfo();
        for (let clip of sfxClips) {
            const man = new SFXManager<TAudioSFX>(this, clip);
            this.sfxMap.set(man.info.key as TAudioSFX, man);
        }
    }

    /**
     * Sets the volume multiplier for all tracks. This will
     * be multiplied by the track volume to get the overall
     * volume. Settings this to zero is effectively a mute
     * on every track played by this.
     * @param volume Volume multiplier for all music played
     * by this scene.
     */
    setMusicVolume(volume: number) {
        this.musicVolume = volume;
        this.recomputeVolume();
    }

    /**
     * Sets the volume of the individual track. This will
     * not affect the volume of any subsequent tracks.
     * @param volume Volume for the current audio track.
     */
    setTrackVolume(volume: number) {
        this.trackVolume = volume;
        this.recomputeVolume();
    }

    private recomputeVolume() {
        this.audio.volume = this.getVolume();
    }

    private getVolume() {
        return this.trackVolume * this.musicVolume;
    }

    playSfx(clip: TAudioSFX) {
        const sfx = this.sfxMap.get(clip);
        if (!sfx) {
            console.warn('Trying to play non-existent clip', clip);
        } else {
            sfx.play();
        }
    }

    play(audio: string, loop: boolean, fade_in: boolean, trackVolume: number = 1, force_restart: boolean = false) {
        if (audio == this.current_clip && !force_restart) return;

        this.stop();
        if (this.fadeTween) {
            this.fadeTween.stop();
            this.fadeTween = null;
        }
        this.audio = this.sound.add(audio, { loop: loop });
        this.audio.play();
        console.log("Now Playing - " + audio);
        this.trackVolume = trackVolume;
        if (fade_in) {
            this.fadeAudio(false, 1000);
        } else {
            this.recomputeVolume();
        }
        this.current_clip = audio;
    }

    fadeOut(duration: number) {
        this.fadeAudio(true, duration, () => {
            this.stop();
        });
    }

    fadeAudio(fadingOut: boolean, duration: number, callback?: () => void) {
        if (this.fadeTween) this.fadeTween.stop();
        this.audio.volume = fadingOut ? this.getVolume() : 0;

        this.fadeTween = this.tweens.addCounter({
            from: 0, 
            to: 100,
            duration,
            onUpdate: tween => {
                const from = fadingOut ? this.getVolume() : 0;
                const to = fadingOut ? 0 : this.getVolume();
                this.audio.volume = Phaser.Math.Linear(from, to, to / 100);
            },
            onStop: () => {
                this.recomputeVolume();
            },
            onComplete: () => {
                this.fadeTween = null;
                this.recomputeVolume();
                callback?.();
            }
        });
    }

    stop() {
        if (!this.audio) return;
        this.audio.stop();
        this.audio = null;
        this.current_clip = null;
    }

    static registerClips(scene: Phaser.Scene, clips: SFXInfo<string>[]) {
        for (const info of clips) {
            const assets = Array.isArray(info.asset) ? info.asset : [info.asset];
            for (const asset of assets) {
                scene.load.audio(asset.loadKey, asset.url);
            }
        }
    }

    getSfxInfo(): SFXInfo<TAudioSFX>[] {
        return [];
    }
}

export class KHAudioScene extends KHGenericAudioScene<string> {
    static readonly NAME = "KHAudioScene";

    constructor() {
        super(KHAudioScene.NAME);
    }
}