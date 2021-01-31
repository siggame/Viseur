import {
    DisableableElement,
    DisableableElementArgs,
} from "src/core/ui/disableable-element";
import { Immutable } from "src/utils";
import { createEventEmitter } from "ts-typed-events";
import { Field } from "../field";
import * as baseInputHbs from "./base-input.hbs";

/** The base arguments for any input. */
export interface BaseInputArgs<T> extends DisableableElementArgs {
    /** The input type. */
    type?: string;

    /** Title of the label to create a Field for. */
    label?: string;

    /** True if it should be disabled upon initialization, false otherwise. */
    disabled?: boolean;

    /** The hint for the field. */
    hint?: string;

    /** The starting value. */
    value?: T;
}

/** The base class all input elements inherit from. */
export class BaseInput<T> extends DisableableElement {
    /** Event and emitter for changed. */
    private readonly emitChanged = createEventEmitter<T>();

    /** Emitted when this input's value changes. */
    public readonly eventChanged = this.emitChanged.event;

    /** The label field, if set. */
    public readonly field?: Field;

    /** The actual value of the input. */
    protected actualValue: T;

    /**
     * Initializes the base input settings, should be called as super.
     *
     * @param args - The initial args for the input and field.
     * @param template - An optional template override.
     */
    constructor(args: Immutable<BaseInputArgs<T>>, template?: Handlebars) {
        super(args, template || baseInputHbs);

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
            this.value = this.getElementValue() as T;
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
            this.emitChanged(newValue);
        }

        const elemValue = this.getElementValue();
        let checkValue = this.actualValue;
        if (typeof elemValue === "string") {
            checkValue = (String(checkValue) as unknown) as T;
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

    /** Disables this input. */
    public disable(): void {
        super.disable();
        if (this.field) {
            this.field.disable();
        }
    }

    /** Enables this input. */
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
    protected getElementValue(): unknown {
        return this.element.val();
    }

    /**
     * Updates the value of the DOM element.
     */
    protected updateElementValue(): void {
        this.element.val((this.actualValue as unknown) as string);
    }
}
