import { INumberInputArgs, Slider } from "src/core/ui/inputs";
import { BaseSetting, IBaseSettingArgs } from "./base-setting";

/** Represents a setting that is a number controlled via a slider */
export class SliderSetting extends BaseSetting<number> {
    constructor(args: INumberInputArgs & IBaseSettingArgs<number>) {
        super(args, Slider);
    }

    /**
     * Optional override to transform the value to a number
     * @param value the value to transform
     * @returns the value transformed
     */
    protected transformValue(value: number): number {
        return Number(value);
    }
}
