import { Immutable } from "src/utils";
import { onceTransitionEnds } from "src/utils/jquery";
import { BaseElement, BaseElementArgs } from "../base-element";
import * as modalHbs from "./modal.hbs";
import "./modal.scss";

/** A modal that floats above the screen and blocks out all other input. */
export class Modal extends BaseElement {
    /** The content of the modal. */
    private readonly content: JQuery;

    /**
     * Creates a modal.
     *
     * @param args - The arguments for the modal.
     */
    constructor(args: Immutable<BaseElementArgs>) {
        super(args, modalHbs);

        this.content = this.element.find(".modal-content");
        this.element.addClass("hidden");
    }

    /**
     * Shows the modal with some element inside it.
     *
     * @param element - A jquery element, or a raw string to put inside this modal.
     * @param callback - The optional callback to execute after showing
     * (not after animation, but after show is invoked async).
     */
    public show(element: JQuery, callback?: () => void): void {
        this.element.removeClass("hidden");

        setImmediate(() => {
            this.element.addClass("show");

            if (callback) {
                onceTransitionEnds(this.element, callback);
            }
        });

        this.content.html("").append(element);
    }

    /** Hides the modal. */
    public hide(): void {
        onceTransitionEnds(this.element.removeClass("show"), () => {
            this.element.addClass("hidden");
        });
    }
}
