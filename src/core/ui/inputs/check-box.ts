import { Immutable } from "src/utils";
import { BaseInput, BaseInputArgs } from "./base-input";

/** A checkbox for booleans. */
export class CheckBox extends BaseInput<boolean> {
    /**
     * Creates a checkbox for boolean values.
     *
     * @param args - The args to initialize, value must be boolean.
     */
    constructor(args: Immutable<BaseInputArgs<boolean>>) {
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
     * Gets if the checkbox is checked.
     */
    public get value(): boolean {
        return Boolean(super.value);
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
