import { NumberInputArgs, Slider } from "src/core/ui/inputs";
import { BaseSetting, BaseSettingArgs } from "./base-setting";

/** Represents a setting that is a number controlled via a slider. */
export class SliderSetting extends BaseSetting<number> {
    constructor(args: NumberInputArgs & BaseSettingArgs<number>) {
        super(args, Slider);
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
