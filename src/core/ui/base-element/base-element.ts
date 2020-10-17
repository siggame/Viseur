import * as $ from "jquery";
import { partial } from "src/core/partial";
import { Immutable } from "src/utils";
import * as baseElementHbs from "./base-element.hbs";

/** BaseElement constructor args. */
export interface BaseElementArgs {
    /** Id to assign to. */
    id?: string;

    /** Parent element to attach this newly constructed element to. */
    parent?: HTMLElement | JQuery;
}

/**
 * A wrapper for some HTML element(s) that are instantiated via a handlebars
 * template.
 */
export abstract class BaseElement {
    /** The ID of the element. */
    public readonly id?: string;

    /** The parent element of this element. */
    public readonly parent?: JQuery;

    /** The raw element this is wrapped around. */
    public readonly element: JQuery;

    /**
     * Creates a new base element.
     *
     * @param args - The arguments to set value(s) from in the template.
     * @param template - The handlebars template to use.
     */
    constructor(
        args: Immutable<BaseElementArgs>,
        protected readonly template: Handlebars,
    ) {
        this.id = args.id;
        this.parent = args.parent && $(args.parent);
        this.element = partial(
            this.template || baseElementHbs,
            args,
            this.parent,
        );
    }
}
