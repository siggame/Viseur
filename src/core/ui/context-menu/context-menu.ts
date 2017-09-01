import * as $ from "jquery";
import partial from "src/core/partial";
import { BaseElement, IBaseElementArgs } from "../base-element";
import "./context-menu.scss";

export interface IMenuItem {
    /** hover over title */
    description: string;

    /** the text name of the item */
    text: string;

    /** the icon id from font awesome (without the "fa-" prefix) */
    icon: string;

    /** Callback function to invoke whenever this menu item is clicked */
    callback: () => void;
}

export type MenuItems = Array<"---" | IMenuItem>;

/** A custom right click menu */
export class ContextMenu extends BaseElement {
    /**
     * callback to add/remove to document to hide the listener
     */
    private offHide: () => void;

    /**
     * Creates a context menu
     * @param args base element args with optional structure
     */
    constructor(args: IBaseElementArgs & {
        structure?: Array<"---" | IMenuItem>,
    }) {
        super(args);

        this.hide();

        if (args.structure) {
            this.setStructure(args.structure);
        }

        this.element.on("click", (e) => {
            if (!this.element.hasClass("collapsed")) {
                e.stopPropagation();
            }
        });

        this.offHide = () => this.hide();
    }

    /**
     * Sets, and rebuilds, the structure of this context menu
     *
     * @param {Array} structure - array of the structure, in order. Can be object for items, or "---" for seperators
     */
    public setStructure(structure: MenuItems): void {
        this.element.html(""); // clear out any structure we had

        for (const item of structure) {
            if (item === "---") {
                this.element.append($("<hr>"));
            }
            else { // it's a menu item
                const elem = partial(require("./context-menu-item.hbs"), item, this.element);

                elem.on("click", (e) => {
                    e.stopPropagation();
                    item.callback();
                    this.hide();
                });
            }
        }
    }

    /**
     * Displays the context menu
     * @param x the position of the context menu in pixels
     * @param y the position of the context menu in pixels
     */
    public show(x: number, y: number): void {
        this.element
            .css("left", x)
            .css("top", y)
            .removeClass("collapsed");

        $(document).on("click", this.offHide);
    }

    /**
     * Hides the context menu
     */
    public hide(): void {
        this.element.addClass("collapsed");
        $(document).off("click", this.offHide);
    }

    protected getTemplate(): Handlebars {
        return require("./context-menu.hbs");
    }
}
