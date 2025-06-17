import { inRange } from "../KHHelperFunctions";
import { KHMenuOption } from "./KHMenuOption";

export class KHMenuLinkOption extends KHMenuOption {
    
    constructor(text: string, url: string, description: string, selectable: boolean = true, extras: {} = {}) {
        super(text, description, selectable, () => {
            window.open(url, "_blank");
        }, null, extras);
    }
}
