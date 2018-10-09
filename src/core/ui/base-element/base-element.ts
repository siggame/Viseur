import * as $ from "jquery";
import partial from "src/core/partial";

/** BaseElement constructor args */
export interface IBaseElementArgs {
    /** id to assign to */
    id?: string;
    /** parent element to attach this newly constructed element to */
    parent?: HTMLElement | JQuery<HTMLElement>;
}

/**
 * A wrapper for some HTML element(s) that are instantiated via a handlebars template
 */
export class BaseElement {
    /** The ID of the element */
    public readonly id?: string;

    /** The parent element of this element */
    public parent?: JQuery<HTMLElement>;

    /** The raw element this is wrapped around */
    public readonly element: JQuery<HTMLElement>;

    /**
     * Creates a new base element
     * @param args the arguments to set value(s) from
     */
    constructor(args?: IBaseElementArgs) {
        args = args || {};

        this.id = args.id;
        if (args.parent) {
            this.parent = $(args.parent) as JQuery<HTMLElement>; // TODO: bad
        }

        this.element = partial(this.getTemplate(), args, this.parent);
    }

    /**
     * Sets the parent of this element
     * @param newParent the new parent to set this to
     */
    public setParent(newParent: JQuery<HTMLElement> | HTMLElement): void {
        this.parent = $(newParent) as JQuery<HTMLElement>;
    }

    /**
     * Gets the template used to create this base element
     * @returns the handlebars template required
     */
    protected getTemplate(): Handlebars {
        return require("./base-element.hbs");
    }
}
