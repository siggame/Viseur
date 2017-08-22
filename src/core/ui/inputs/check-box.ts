import { BaseInput, IBaseInputArgs } from "./base-input";

/** a checkbox for booleans */
export class CheckBox extends BaseInput {
    constructor(args: IBaseInputArgs) {
        super(Object.assign({
            value: Boolean(args.value),
            type: "checkbox",
        }, args));
    }

    /**
     * Sets if this has been pressed (true) or not (false)
     */
    public set value(newValue: boolean) {
        super.value = Boolean(newValue);
    }

    /**
     * Enforced that when clicked is a boolean
     *
     * @override
     */
    protected updateElementValue(): void {
        this.element.prop("checked", this.value);
    }

    /**
     * Gets if it is checked or not
     *
     * @override
     */
    protected getElementValue(): boolean {
        return Boolean(this.element.prop("checked"));
    }
}
