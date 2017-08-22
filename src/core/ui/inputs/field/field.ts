import { BaseElement, IBaseElementArgs } from "src/core/ui/base-element";
import "./field.scss";

/** A wrapper for an Input that gives it a label */
export class Field extends BaseElement {
    /** The input this is a field for */
    public readonly input: BaseElement;

    constructor(args: IBaseElementArgs & {
        /** the input this is a field for */
        input: BaseElement,

        /** the label text */
        label: string,

        /** the title for the label */
        hint?: string,
    }) {
        super(args);

        this.input = args.input;

        this.element.append(this.input.element);
    }

    protected getTemplate(): Handlebars {
        return require("./field.hbs");
    }
}
