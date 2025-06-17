import { KHContainer } from "./KHContainer";

export class KHBootlegNinePatch extends KHContainer {
    images: Phaser.GameObjects.Image[];
    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, border_width: number, corner: string, side: string) {
        super(scene, x, y, w, h, null, 0, border_width, false);
        this.images = [];
        this.setUpImages(border_width, corner, side);
    }

    setUpImages(border_width: number, corner: string, side: string) {
        let half_w = border_width/2;

        // Corners
        this.images.push(this.scene.add.image(-half_w, -half_w, corner).setAngle(0));
        this.images.push(this.scene.add.image(-half_w + this.c_w + border_width, -half_w, corner).setAngle(90));
        this.images.push(this.scene.add.image(-half_w, -half_w + this.c_h + border_width, corner).setAngle(270));
        this.images.push(this.scene.add.image(-half_w + this.c_w + border_width, -half_w + this.c_h + border_width, corner).setAngle(180));

        // Sides
        this.images.push(this.scene.add.image(-half_w, this.c_h/2, side).setDisplaySize(border_width, this.c_h).setAngle(0));
        this.images.push(this.scene.add.image(half_w + this.c_w, this.c_h/2, side).setDisplaySize(border_width, this.c_h).setAngle(0));

        // Top and bottom
        this.images.push(this.scene.add.image(this.c_w/2, -half_w, side).setDisplaySize(border_width, this.c_w).setAngle(90));
        this.images.push(this.scene.add.image(this.c_w/2, half_w + this.c_h, side).setDisplaySize(border_width, this.c_w).setAngle(90));

        this.add(this.images);
    }
    
    setTint(color: number) {
        for (let i = 0; i < this.images.length; i++) {
            this.images[i].setTint(color);
        }
    }
}