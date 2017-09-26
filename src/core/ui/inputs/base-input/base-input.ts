import { DisableableElement, IDisableableElementArgs } from "src/core/ui/disableable-element";
import { Event, events } from "ts-typed-events";
import { Field } from "../field";

export interface IBaseInputArgs extends IDisableableElementArgs {
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
export class BaseInput<T> extends DisableableElement {
    /** Events this class emits */
    public readonly events = events({
        /** Emitted when this input's value changes */
        changed: new Event<T>(),
    });

    /** the label field, if set */
    public readonly field: Field;

    /** the actual value of the input */
    protected actualValue: T;

    /**
     * Initializes the base input settings, should be called as super
     * @param args the initial args
     */
    constructor(args: IBaseInputArgs & {
        /** starting value */
        value?: T;
    }) {
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

        this.element.on(this.getElementOnEventString(), () => {
            this.value = this.getElementValue();
        });

        this.value = args.value;
    }

    /**
     * Sets the value of this BaseInput
     *
     * @param newValue the new value to set to
     */
    public set value(newValue: T) {
        if (this.actualValue !== newValue) {
            this.actualValue = newValue;
            this.events.changed.emit(newValue);
        }

        const elemValue = this.getElementValue();
        let checkValue: any = this.actualValue;
        if (typeof(elemValue) === "string") {
            checkValue = String(checkValue);
        }

        if (elemValue !== checkValue) {
            this.updateElementValue();
        }
    }

    /**
     * Gets the value of this BaseInput
     * @returns {*} The value of the input, depends on subclass
     */
    public get value(): T {
        return this.actualValue;
    }

    /**
     * Disables this input
     */
    public disable(): void {
        super.disable();
        if (this.field) {
            this.field.disable();
        }
    }

    /**
     * Enables this input
     */
    public enable(): void {
        super.enable();
        if (this.field) {
            this.field.enable();
        }
    }

    /**
     * Gets the string used to listen to the element for events
     * @returns the string for jquery to use
     */
    protected getElementOnEventString(): string {
        return "change";
    }

    /**
     * Gets the value of the DOM element
     * @returns {*} the DOM element's current value
     */
    protected getElementValue(): any {
        return this.element.val();
    }

    /**
     * updates the value of the DOM element
     */
    protected updateElementValue(): void {
        this.element.val(this.actualValue as any);
    }

    protected getTemplate(): Handlebars {
        return require("./base-input.hbs");
    }
}
