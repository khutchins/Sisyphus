import { KHIInputRegistrar } from "../Input/KHIInputRegistrar";
import { KHInputHandler } from "../Input/KHInputHandler";
import { KHContainer } from "../KHContainer";
import { KHScrollView } from "../KHScrollView";
import { KHListInputHandler, KHListInputs } from "./KHListInputHandler";
import { KHMenuOption } from "./KHMenuOption";
import { KHMenuSpec } from "./KHMenuSpec";

export type KHListOptionCreationCallback = (menuOption: KHMenuOption, 
    x: number, y: number, 
    onPointerOver: () => void, onPointerOut: () => void, onPointerLeft: () => void, onPointerRight: () => void,
    onSelect: (optionBounds: Phaser.Geom.Rectangle, buffer: number) => void) => Phaser.GameObjects.GameObject;

export class KHListMenu extends KHContainer {
    scrollContents: KHContainer;
    scrollView: KHScrollView;
    menuSpec: KHMenuSpec;
    inputHandler: KHInputHandler;
    private currentLayoutY;
    private elementHeight;
    private optionCreationCallback: KHListOptionCreationCallback;
    private descriptionUpdateCallback: (string) => void | null;
    private updateCalled: boolean;

    /**
     * Creates a new KHListView. You must call update on this class each frame.
     * 
     * @param scene Scene the view will be added to.
     * @param inputHandler Input handler. Should define keys for "left", "right", "up", "down", and "back".  This script will own the lifecycle of input listening.
     * @param menuSpec Spec for the menu to be created.
     * @param rect Space the view should take up.
     * @param elementHeight Height of each element in the list view.
     * @param scrollRect Space the scrollView should take up.
     * @param extraObjects Other objects to add to the container.
     * @param optionCreationCallback Way to specify the type of menu object created.
     * * @param descriptionUpdateCallback Called when the title is updated.
     * @param descriptionUpdateCallback Called when description is updated.
     */
    constructor(scene: Phaser.Scene, registrar: KHIInputRegistrar, inputHandler: KHListInputHandler | KHInputHandler, menuSpec: KHMenuSpec, rect: Phaser.Geom.Rectangle, elementHeight: number, 
        scrollRect: Phaser.Geom.Rectangle, extraObjects: Phaser.GameObjects.GameObject[] | null,
        optionCreationCallback: KHListOptionCreationCallback, titleUpdateCallback:(text: string) => void | null, descriptionUpdateCallback: (text: string) => void = null) {
        super(scene, rect.x, rect.y, rect.width, rect.height);

        this.inputHandler = inputHandler;
        this.inputHandler?.register(registrar);

        // If the scene shuts down, stop listening on the inputHandler to 
        // prevent inputs for shadow objects.
        scene.events.on('shutdown', () => {
            this.inputHandler?.unregister();
        })

        extraObjects?.forEach(element => {
            this.add(element);
        });

        scene.time.delayedCall(1000, () => {
            if (!this.updateCalled) {
                console.warn("List existed for a second without having update called on it. Non-mouse input will not work.");
            }
        })

        this.currentLayoutY = 0;

        this.optionCreationCallback = optionCreationCallback;
        this.descriptionUpdateCallback = descriptionUpdateCallback;
        this.menuSpec = menuSpec;
        this.elementHeight = elementHeight;
        this.scrollContents = new KHContainer(scene, 0, 0, (this.c_w / 2) - 10, 0, 0x0, 0, 0, false);
        this.scrollView = new KHScrollView(scene, scrollRect.x, scrollRect.y, scrollRect.width, scrollRect.height, this.scrollContents, 20);
        this.add(this.scrollView);

        this.menuSpec.registerCallback("ud", (data: { description: string }) => {
            this.sendUpdateDescription(data.description);
        });

        this.menuSpec.getOptions().forEach((value) => {
            this.addMenuOption(value, false);
        })
        this.addMenuOption(this.menuSpec.getLastOption(), true);

        if (titleUpdateCallback) {
            titleUpdateCallback(this.menuSpec.title);
        }
        this.sendUpdateDescription(this.menuSpec.getDescription());
        this.scrollView.recomputeForBounds();
    }

    private sendUpdateDescription(text: string) {
        if (this.descriptionUpdateCallback) {
            this.descriptionUpdateCallback(text);
        }
    }

    destroy() {
        this.inputHandler?.unregister();
        super.destroy();
    }

    update(now: number) {
        this.updateCalled = true;
        if (this.inputHandler?.isJustDown(KHListInputs.Left)) {
            this.menuSpec.sendSelectPreviousToCurrentOption();
        }
        if (this.inputHandler?.isJustDown(KHListInputs.Right)) {
            this.menuSpec.sendSelectNextToCurrentOption();
        }
        if (this.inputHandler?.isJustDown(KHListInputs.Down)) {
            this.menuSpec.setNextIndex();
        }
        if (this.inputHandler?.isJustDown(KHListInputs.Up)) {
            this.menuSpec.setPreviousIndex();
        }
        if (this.inputHandler?.isJustDown(KHListInputs.Back)) {
            if (this.menuSpec.getLastOption()?.callback) {
                this.menuSpec.getLastOption()?.callback();
            }
        }
    }

    private addMenuOption(menu_option: KHMenuOption, last: boolean = false) {
        if (menu_option == null) {
            return;
        }
        let y = last ? this.c_h - 30 : this.currentLayoutY;
        if (!last) {
            this.currentLayoutY = y + this.elementHeight;
        }
        let x = last ? 5 : 0;

        const text_obj: Phaser.GameObjects.GameObject = this.optionCreationCallback(
            menu_option, x, y,
            () => this.menuSpec.setSelected(menu_option),
            () => this.menuSpec.setSelected(null),
            () => this.menuSpec.sendSelectNextToCurrentOption(),
            () => this.menuSpec.sendSelectPreviousToCurrentOption(),
            (bounds: Phaser.Geom.Rectangle, buffer: number) => {
                if (this.menuSpec.getLastOption() != menu_option) {
                    this.scrollView.scrollToBounds(bounds.x, bounds.y, bounds.width, bounds.height, buffer);
                }
            }
        )
        this.scene.add.existing(text_obj);
        if (!last) {
            this.scrollContents.add(text_obj);
            this.scrollContents.resize(this.scrollContents.c_w, Math.max(this.scrollContents.c_h, this.currentLayoutY));
        } else {
            this.add(text_obj);
        }
    }
}