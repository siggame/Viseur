import { partial } from "src/core/partial";
import { Immutable } from "src/utils";
import { BaseInput, BaseInputArgs } from "../base-input";
import * as dropDownOptionHbs from "./drop-down-option.hbs";
import * as dropDownHbs from "./drop-down.hbs";
/** An option on the drop down. */
export interface DropDownOption<T> {
    /** The display text. */
    text: string;

    /** The selected value. */
    value: T;
}

/** Initialization args for drop down inputs. */
export interface DropDownArgs<T> extends BaseInputArgs<T> {
    /** The options for a drop down in order of display. */
    options: Array<string | DropDownOption<T>>;
}

/** A select with options input. */
export class DropDown<T extends string = string> extends BaseInput<T> {
    /** The options available on this drop down menu. */
    private readonly options: Array<DropDownOption<T>> = [];

    constructor(args: Immutable<DropDownArgs<T>>) {
        super(args, dropDownHbs);

        if (args.options) {
            this.setOptions(args.options, args.value as T);
        }
    }

    /**
     * Sets the value to an item in the drop down.
     *
     * @param newValue - The new value to set the drop down to.
     */
    public set value(newValue: T) {
        if (!this.options) {
            return; // can't set, still in base constructor
        }

        const newOption = this.options.find((opt) => opt.value === newValue);
        if (!newOption) {
            throw new Error(`Cannot find ${newValue} to set for drop down.`);
        }

        super.value = newOption.value;
    }

    /**
     * Gets the value of this BaseInput.
     *
     * @returns The value of the input, depends on subclass.
     */
    public get value(): T {
        return super.value;
    }

    /**
     * Set the options for this Drop Down. Previous options are deleted.
     *
     * @param options - The list of options (in order) for the drop down.
     * @param defaultValue - An optional default value to select,
     * defaults to the first item of options when not set.
     */
    public setOptions(
        options: Immutable<Array<string | DropDownOption<T>>>,
        defaultValue?: T,
    ): void {
        this.options.length = 0;
        this.element.html("");

        for (const option of options) {
            const opt: DropDownOption<T> =
                typeof option === "string"
                    ? { text: option, value: option as T } // T is string
                    : option;

            this.options.push(opt);
            partial(dropDownOptionHbs, opt, this.element);
        }

        if (defaultValue !== undefined) {
            this.value = defaultValue;
        } else if (this.options[0]) {
            this.value = this.options[0].value;
        }
    }
}
