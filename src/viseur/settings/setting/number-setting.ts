import { INumberInputArgs, NumberInput } from "src/core/ui/inputs/number";
import { BaseSetting, IBaseSettingArgs } from "./base-setting";

/** Represents a setting that is a number. */
export class NumberSetting extends BaseSetting<number> {
    constructor(args: INumberInputArgs & IBaseSettingArgs<number>) {
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
