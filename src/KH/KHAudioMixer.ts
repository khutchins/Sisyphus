export class KHAudioTrack {
    readonly key: string;
    readonly sound: Phaser.Sound.BaseSound;
    volume: number;
    mixer: KHAudioMixer;

    constructor(scene: Phaser.Scene, key: string, mixer: KHAudioMixer, volume: number = 1) {
        this.key = key;
        this.sound = scene.sound.add(key);
        this.volume = volume;
        this.mixer = mixer;
    }

    play(volume = 1) {
        this.sound.play({volume: this.mixer.mixerVolume * this.volume * volume});
    }

    setPitch(amount: number) {
        if (this.sound instanceof Phaser.Sound.WebAudioSound || this.sound instanceof Phaser.Sound.HTML5AudioSound) {
            this.sound.setDetune(amount);
        }
    }
}

export class KHAudioMixer {
    mixerVolume: number;
    private sounds: Map<string, KHAudioTrack> = new Map();

    ensureSound(scene: Phaser.Scene, key: string, volume: number = 1) {
        let audio = this.sounds.get(key);
        if (audio == null) {
            audio = new KHAudioTrack(scene, key, this, volume);
            this.sounds.set(key, audio);
        }
        return audio;
    }

    playSound(key: string, volume: number = 1) {
        const audio = this.sounds.get(key);
        audio?.play();
    }
}