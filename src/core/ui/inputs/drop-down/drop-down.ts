import partial from "src/core/partial";
import { BaseInput, IBaseInputArgs } from "../base-input";

export interface IDropDownOption<T> {
    /** the display text */
    text: string;

    /** the selected value */
    value: T;
}

/** A select with options input */
export class DropDown<T> extends BaseInput {
    /** The options available on this drop down menu */
    private options: Array<IDropDownOption<T>> = [];

    constructor(args: IBaseInputArgs & {
        options: Array<string | IDropDownOption<T>>,
    }) {
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
        const oldValue = this.value;
        const newOption = this.options.find((opt) => opt.value === newValue);
        this.actualValue = newOption
            ? newOption.value
            : oldValue;
    }

    /**
     * Set the options for this Drop Down. Previous options are deleted.
     * @param options - list of options (in order) for the drop down
     * @param defaultValue optional default value to select, defaults to the first item of options when not set
     */
    public setOptions(options: Array<string | IDropDownOption<T>>, defaultValue: T): void {
        if (options === this.options) {
            return;
        }

        this.options.length = 0;
        this.element.html("");

        for (let option of options) {
            if (typeof(option) === "string") {
                option = { text: option, value: option as any };
            }

            this.options.push(option);
            partial(require("./dropDownOption.hbs"), option, this.element);
        }

        this.value = defaultValue || this.options[0] && this.options[0].value;
    }

    protected getTemplate(): Handlebars {
        return require("./dropDown.hbs");
    }
}
