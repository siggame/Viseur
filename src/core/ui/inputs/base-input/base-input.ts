import { BaseElement, IBaseElementArgs } from "src/core/ui/base-element";
import { Field } from "../field";

export interface IBaseInputArgs extends IBaseElementArgs {
    /** the input type */
    type?: string;

    /** title of the label to create a Field for */
    label?: string;

    /** true if it should be disabled upon initialization, false otherwise */
    disabled?: boolean;

    /** the hint for the field */
    hint?: string;

    /** starting value */
    value?: any;
}

/** The base class all input elements inherit from */
export class BaseInput extends BaseElement {
    /** the label field, if set */
    public readonly field: Field;

    /** the actual value of the input */
    protected actualValue: any;

    constructor(args: IBaseInputArgs) {
        super(args);

        if (args.label) {
            this.field = new Field({
                id: this.id,
                label: args.label,
                hint: args.hint,
                input: this,
                parent: this.parent,
            });
        }

        if (args.disabled) {
            this.disable();
        }

        this.element.on("change input", () => {
            this.value = this.getElementValue();
            this.emit("changed", this.value);
        });

        this.value = args.value;
    }

    /**
     * Sets the value of this BaseInput
     *
     * @param newValue the new value to set to
     */
    public set value(newValue: any) {
        this.actualValue = newValue;
    }

    /**
     * Gets the value of this BaseInput
     *
     * @returns {*} The value of the input, depends on subclass
     */
    public get value(): any {
        return this.actualValue;
    }

    /**
     * Disables this input
     */
    public disable(): void {
        this.element.prop("disabled", true);
    }

    /**
     * Enables this input
     */
    public enable(): void {
        this.element.prop("disabled", false);
    }

    /**
     * Gets the value of the DOM element
     *
     * @returns {*} - the DOM element's current value
     */
    protected getElementValue(): any {
        return this.element.val();
    }

    /**
     * updates the value of the DOM element
     */
    protected updateElementValue(): void {
        this.element.val(this.value);
    }

    protected getTemplate(): Handlebars {
        return require("./base-input.hbs");
    }
}
