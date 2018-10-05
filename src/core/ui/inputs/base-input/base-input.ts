import { DisableableElement, IDisableableElementArgs,
       } from "src/core/ui/disableable-element";
import { Immutable } from "src/utils";
import { Event, events } from "ts-typed-events";
import { Field } from "../field";

export interface IBaseInputArgs<T> extends IDisableableElementArgs {
    /** the input type */
    type?: string;

    /** title of the label to create a Field for */
    label?: string;

    /** true if it should be disabled upon initialization, false otherwise */
    disabled?: boolean;

    /** the hint for the field */
    hint?: string;

    /** starting value */
    value?: T;
}

/** The base class all input elements inherit from */
export class BaseInput<T> extends DisableableElement {
    /** Events this class emits */
    public readonly events = events({
        /** Emitted when this input's value changes */
        changed: new Event<T>(),
    });

    /** the label field, if set */
    public readonly field?: Field;

    /** the actual value of the input */
    protected actualValue: T;

    /**
     * Initializes the base input settings, should be called as super.
     *
     * @param args - The initial args.s
     */
    constructor(args: Immutable<IBaseInputArgs<T>>) {
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

        this.value = args.value as T;
        this.actualValue = args.value as T;
    }

    /**
     * Sets the value of this BaseInput.
     *
     * @param newValue - The new value to set to.
     */
    public set value(newValue: T) {
        if (this.actualValue !== newValue) {
            this.actualValue = newValue;
            this.events.changed.emit(newValue);
        }

        const elemValue = this.getElementValue();
        let checkValue = this.actualValue;
        if (typeof(elemValue) === "string") {
            // tslint:disable-next-line:no-any no-unsafe-any - safe, is string
            checkValue = String(checkValue) as any;
        }

        if (elemValue !== checkValue) {
            this.updateElementValue();
        }
    }

    /**
     * Gets the value of this BaseInput.
     *
     * @returns - The value of the input, depends on subclass.
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
     * Gets the string used to listen to the element for events.
     *
     * @returns The string for jquery to use.
     */
    protected getElementOnEventString(): string {
        return "change";
    }

    /**
     * Gets the value of the DOM element.
     *
     * @returns The DOM element's current value.
     */
    protected getElementValue(): any { // tslint:disable-line:no-any
        return this.element.val();
    }

    /**
     * updates the value of the DOM element
     */
    protected updateElementValue(): void {
        this.element.val(this.actualValue as any); // tslint:disable-line:no-any
    }

    protected getTemplate(): Handlebars {
        // tslint:disable-next-line:no-require-imports
        return require("./base-input.hbs");
    }
}
