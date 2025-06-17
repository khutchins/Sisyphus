import { KHContainer } from "./KHContainer";

// We want to block scrolling if mouse is over game area.
let phaser_game_block_scroll: boolean = false;
window.addEventListener("wheel", function(e){ 
    if (phaser_game_block_scroll) e.preventDefault(); 
}, {passive: false} );

export class KHScrollView extends KHContainer {
    contents: KHContainer;
    private offX: number;
    private offY: number;
    private _scroll_bar: Phaser.GameObjects.Sprite;
    private _down_on_scroll_bar: boolean;
    private _input_blocker_top: Phaser.GameObjects.Sprite;
    private _input_blocker_bottom: Phaser.GameObjects.Sprite;

    /**
     * 
     * @param scene Scene this scroll view belongs to.
     * @param x X-coordinate of the scroll view.
     * @param y Y-coordinate of the scroll view.
     * @param w Width of the display window.
     * @param h Height of the display window.
     * @param contents Container that the contents are all inside of.
     */
    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, contents: KHContainer, scroll_strength: number = 9) {
        super(scene, x, y, w, h, 0, 0, 0, true);
        this.contents = contents;
        this.add(contents);

        // This will block scrolling in this scene if mouse is over the game area.
        this.scene.input.on('gameout', function () {
            phaser_game_block_scroll = false;
        });
        this.scene.input.on('gameover', function () {
            phaser_game_block_scroll = true;
        });

        this._scroll_bar = scene.add.sprite(0, 0, 'scroll_bar').setDepth(500).setOrigin(0, 0);
        this._scroll_bar.setPosition(this.c_w - this._scroll_bar.displayWidth, this._scroll_bar.y);
        this._scroll_bar.setInteractive();
        this.add(this._scroll_bar);
        this._down_on_scroll_bar = false;
        let barHeight = this._scroll_bar.displayHeight  / 2;

        // Blocks input on elements in container view if they are outside of the scroll view bounds.
        // It's pretty hacky, but it works.
        this._input_blocker_top = this.scene.add.sprite(0, 0, 'pixel').setDisplaySize(this.c_w, this.contents.c_h).setOrigin(0).setAlpha(0.00001).setInteractive().setDepth(0);
        this.add(this._input_blocker_top);
        this._input_blocker_bottom = this.scene.add.sprite(0, 0, 'pixel').setDisplaySize(this.c_w, this.contents.c_h).setOrigin(0).setAlpha(0.00001).setInteractive().setDepth(0);
        this.add(this._input_blocker_bottom);

        this._scroll_bar.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this._down_on_scroll_bar = true;
            this.setScrollBarPosition(pointer.y - this.y - barHeight)
        });
        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!pointer.isDown) {
                this._down_on_scroll_bar = false;
            }
            else if (this._down_on_scroll_bar) {
                this.setScrollBarPosition(pointer.y - this.y - barHeight)
            }
        });
        this._scroll_bar.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            this._down_on_scroll_bar = false;
        });
        this.scene.input.on('wheel', (pointer, currentlyOver, dx, dy, dz, event) => {
            let offset = pointer.deltaY > 0 ? -scroll_strength : (pointer.deltaY < 0 ? scroll_strength : 0);
            this.setScrollOffset(this.offX, this.offY + offset);
        });

        this.setScrollOffset(0, 0);
        this.recomputeForBounds();
    }

    getOffX(): number {
        return this.offX;
    }

    getOffY(): number {
        return this.offY;
    }

    recomputeForBounds(): void {
        if (this.contents.c_h > this.c_h) {
            this._scroll_bar.setVisible(true);
            this._scroll_bar.setInteractive();
            this.setBackground(0, 0.3);
            this._input_blocker_top.setDisplaySize(this.c_w, this.contents.c_h);
            this._input_blocker_top.setPosition(0, -this.contents.c_h);
            this._input_blocker_top.setVisible(true);
            this._input_blocker_bottom.setDisplaySize(this.c_w, this.contents.c_h);
            this._input_blocker_bottom.setPosition(0, this.c_h);
            this._input_blocker_bottom.setVisible(true);
        } else {
            this._scroll_bar.setVisible(false);
            this._scroll_bar.removeInteractive();
            this.setBackground(0, 0);
            this._input_blocker_top.setVisible(false);
            this._input_blocker_bottom.setVisible(false);
        }
    }

    setScrollBarPosition(y: number) {
        let percent = y / (this.c_h - this._scroll_bar.displayHeight)
        percent = Math.min(1, Math.max(0, percent));
        // let scroll_bounds = [this.contents.c_w - this.c_w, this.contents.c_h - this.c_h];
        this.setScrollOffset(this.offX, -percent * (this.contents.c_h - this.c_h));
    }

    /**
     * Scrolls the view so that the given coordinates are all on-screen (if
     * possible). Coordinates should be in the space of the content container.
     */
    scrollToBounds(x: number, y: number, w: number, h: number, buffer: number = 0) {
        let newX = this.offX, newY = this.offY;

        x += buffer;
        y -= buffer;
        w += buffer * 2;
        h += buffer * 2;

        // Goes beyond right side bounds.
        if (x + w > this.offX + this.c_w) newX = this.c_w - (x + w);
        // Goes beyond left side bounds. If both this and the above are true,
        // will prefer the left side over the right.
        if (x < this.offX) newX = x;

        // Goes beyond bottom side bounds.
        if (y + h > -this.offY + this.c_h) newY = this.c_h - (y + h);
        // Goes beyond top side bounds. If both this and the above are true,
        // will prefer the top side over the bottom.
        if (y < -this.offY) newY = -y;

        this.setScrollOffset(newX, newY);
    }

    /**
     * Directly sets the scroll offset to this point. Useful if you want to
     * scroll to a specific point. If you want to keep a specific element
     * onscreen, use scrollToBounds.
     */
    setScrollOffset(x: number, y: number) {
        let scroll_bounds = [this.contents.c_w - this.c_w, this.contents.c_h - this.c_h];
        x = Math.min(0, Math.max(-scroll_bounds[0], x));
        y = Math.min(0, Math.max(-scroll_bounds[1], y));
        this.offX = x;
        this.offY = y;
        this.contents.setPosition(x, y);
        this._scroll_bar.setY((-y / scroll_bounds[1]) * (this.c_h - this._scroll_bar.displayHeight));
        // console.log(y, this._scroll_bar.y);
    }
}