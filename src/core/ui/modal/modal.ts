import { onceTransitionEnds } from "src/utils/jquery";
import { BaseElement, IBaseElementArgs } from "../base-element";
import "./modal.scss";

/** A modal that floats above the screen and blocks out all other input */
export class Modal extends BaseElement {
    /** the content of the modal */
    private readonly content: JQuery;

    constructor(args: IBaseElementArgs) {
        super(args);

        this.content = this.element.find(".modal-content");
        this.element.addClass("hidden");
    }

    /**
     * Shows the modal with some element inside it
     * @param {$|string} element - a jquery element, or a raw string to put inside this modal
     * @param {function} [callback] - callback to execute after showing
     * (not after animation, but after show is invoked async)
     */
    public show(element: JQuery, callback?: () => void): void {
        this.element.removeClass("hidden");

        setImmediate(() => {
            this.element.addClass("show");

            if (callback) {
                onceTransitionEnds(this.element, callback);
            }
        });

        this.content
            .html("")
            .append(element);
    }

    /**
     * Hides the modal
     */
    public hide(): void {
        onceTransitionEnds(this.element.removeClass("show"), () => {
            this.element.addClass("hidden");
        });
    }

    protected getTemplate(): Handlebars {
        return require("./modal.hbs");
    }
}
