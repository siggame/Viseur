import { BaseElement } from "src/core/ui/base-element";
import { DisableableElement, IDisableableElementArgs } from "src/core/ui/disableable-element";
import fieldHbs from "./field.hbs"; // tslint:disable-line:match-default-export-name
import "./field.scss";

/** A wrapper for an Input that gives it a label */
export class Field extends DisableableElement {
    /** The input this is a field for */
    public readonly input: BaseElement;

    /**
     * Creates a field to wrap around an inputs.
     *
     * @param args - This must include an input and label for the field.
     */
    constructor(args: Readonly<IDisableableElementArgs & {
        /** the input this is a field for */
        input: BaseElement;

        /** the label text */
        label: string;

        /** the title for the label */
        hint?: string;
    }>) {
        super(args, fieldHbs);

        this.input = args.input;

        this.element.append(this.input.element);
    }

    /**
     * Disables this field.
     */
    public disable(): void {
        this.element.addClass("disabled");
    }

    /**
     * Enables this field.
     */
    public enable(): void {
        this.element.removeClass("disabled");
    }
}
