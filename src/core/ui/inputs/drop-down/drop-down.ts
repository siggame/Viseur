import partial from "src/core/partial";
import { BaseInput, IBaseInputArgs } from "../base-input";

export interface IDropDownOption<T> {
    /** the display text */
    text: string;

    /** the selected value */
    value: T;
}

export interface IDropDownArgs<T> extends IBaseInputArgs {
    options: Array<string | IDropDownOption<T>>;
}

/** A select with options input */
export class DropDown<T> extends BaseInput<T> {
    /** The options available on this drop down menu */
    private readonly options: Array<IDropDownOption<T>> = [];

    constructor(args: IDropDownArgs<T>) {
        super(args);

        if (args.options) {
            this.setOptions(args.options, args.value);
        }
    }

    /**
     * Sets the value to an item in the drop down
     * @param newValue the new value to set the drop down to
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
     * Gets the value of this BaseInput
     * @returns {*} The value of the input, depends on subclass
     */
    public get value(): T {
        return super.value;
    }

    /**
     * Set the options for this Drop Down. Previous options are deleted.
     * @param options - list of options (in order) for the drop down
     * @param defaultValue optional default value to select, defaults to the first item of options when not set
     */
    public setOptions(options: Array<string | IDropDownOption<T>>, defaultValue?: T): void {
        this.options.length = 0;
        this.element.html("");

        for (let option of options) {
            if (typeof(option) === "string") {
                option = { text: option, value: option as any };
            }

            this.options.push(option);
            partial(require("./drop-down-option.hbs"), option, this.element);
        }

        this.value = defaultValue !== undefined
            ? defaultValue
            : this.options[0].value;
    }

    protected getTemplate(): Handlebars {
        return require("./drop-down.hbs");
    }
}
