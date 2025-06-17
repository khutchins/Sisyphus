import { KHIInputRegistrar } from "../Input/KHIInputRegistrar";
import { KHInputHandler } from "../Input/KHInputHandler";
import { KHContainer } from "../KHContainer";
import { KHListInputHandler, KHListInputs } from "./KHListInputHandler";
import { KHMenuOption } from "./KHMenuOption";
import { KHMenuSpec } from "./KHMenuSpec";

export type KHSimpleListOptionCreationCallback = (menuOption: KHMenuOption, 
    onPointerOver: () => void, onPointerOut: () => void, onPointerLeft: () => void, onPointerRight: () => void,
    onSelect: (optionBounds: Phaser.Geom.Rectangle, buffer: number) => void) => Phaser.GameObjects.GameObject;

export class KHSimpleListMenu extends KHContainer {
    menuSpec: KHMenuSpec;
    inputHandler: KHInputHandler;
    private optionCreationCallback: KHSimpleListOptionCreationCallback;
    private descriptionUpdateCallback: (string) => void | null;
    private updateCalled: boolean = false;

    /**
     * Creates a new KHSimpleListMenu. You must call update on this class each frame.
     * 
     * @param scene Scene the view will be added to.
     * @param inputHandler Input handler. Should define keys for "left", "right", "up", "down", and "back". This script will own the lifecycle of input listening.
     * @param menuSpec Spec for the menu to be created.
     * @param rect Space the view should take up.
     * @param elementHeight Height of each element in the list view.
     * @param scrollRect Space the scrollView should take up.
     * @param extraObjects Other objects to add to the container.
     * @param optionCreationCallback Way to specify the type of menu object created.
     * * @param descriptionUpdateCallback Called when the title is updated.
     * @param descriptionUpdateCallback Called when description is updated.
     */
    constructor(scene: Phaser.Scene, registrar: KHIInputRegistrar, inputHandler: KHListInputHandler | KHInputHandler, menuSpec: KHMenuSpec, rect: Phaser.Geom.Rectangle, extraObjects: Phaser.GameObjects.GameObject[] | null,
        optionCreationCallback: KHSimpleListOptionCreationCallback, titleUpdateCallback:(text: string) => void | null, descriptionUpdateCallback: (text: string) => void = null) {
        super(scene, rect.x, rect.y, rect.width, rect.height);

        this.inputHandler = inputHandler;
        this.inputHandler.register(registrar);

        // If the scene shuts down, stop listening on the inputHandler to 
        // prevent inputs for shadow objects.
        scene.events.on('shutdown', () => {
            this.inputHandler.unregister();
        })

        extraObjects?.forEach(element => {
            this.add(element);
        });

        scene.time.delayedCall(1000, () => {
            if (!this.updateCalled) {
                console.warn("List existed for a second without having update called on it. Non-mouse input will not work.");
            }
        })

        this.optionCreationCallback = optionCreationCallback;
        this.descriptionUpdateCallback = descriptionUpdateCallback;
        this.menuSpec = menuSpec;

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
    }

    private sendUpdateDescription(text: string) {
        if (this.descriptionUpdateCallback) {
            this.descriptionUpdateCallback(text);
        }
    }

    destroy() {
        this.inputHandler.unregister();
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

        const text_obj: Phaser.GameObjects.GameObject = this.optionCreationCallback(
            menu_option,
            () => this.menuSpec.setSelected(menu_option),
            () => this.menuSpec.setSelected(null),
            () => this.menuSpec.sendSelectNextToCurrentOption(),
            () => this.menuSpec.sendSelectPreviousToCurrentOption(),
            (bounds: Phaser.Geom.Rectangle, buffer: number) => {
            }
        )
        this.scene.add.existing(text_obj);
        this.add(text_obj);
    }
}