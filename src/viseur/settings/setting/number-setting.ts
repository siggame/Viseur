import { NumberInput, NumberInputArgs } from "src/core/ui/inputs/number";
import { BaseSetting, BaseSettingArgs } from "./base-setting";

/** Represents a setting that is a number. */
export class NumberSetting extends BaseSetting<number> {
    constructor(args: NumberInputArgs & BaseSettingArgs<number>) {
        super(args, NumberInput);
    }

    /**
     * Optional override to transform the value to a number.
     *
     * @param value - The value to transform.
     * @returns The value transformed.
     */
    protected transformValue(value: number): number {
        return Number(value);
    }
}
