import { Immutable } from "src/utils";
import { BaseInput, IBaseInputArgs } from "./base-input";

/** a checkbox for booleans */
export class CheckBox extends BaseInput<boolean> {
    /**
     * Creates a checkbox for boolean values.
     *
     * @param args - The args to initialize, value must be boolean.
     */
    constructor(args: Immutable<IBaseInputArgs<boolean>>) {
        super({
            value: Boolean(args.value),
            type: "checkbox",
            ...args,
        });
    }

    /**
     * Sets if this has been pressed (true) or not (false).
     */
    public set value(newValue: boolean) {
        super.value = Boolean(newValue);
    }

    /**
     * Gets if it is checked or not.
     *
     * @returns True if checked, false otherwise.
     */
    protected getElementValue(): boolean {
        return Boolean(this.element.prop("checked"));
    }

    /**
     * Enforced that when clicked is a boolean.
     */
    protected updateElementValue(): void {
        this.element.prop("checked", this.actualValue);
    }
}
