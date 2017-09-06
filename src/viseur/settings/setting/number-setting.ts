import { INumberInputArgs, NumberInput } from "src/core/ui/inputs/number";
import { BaseSetting, IBaseSettingArgs } from "./base-setting";

/** Represents a setting that is a number */
export class NumberSetting extends BaseSetting<number> {
    constructor(args: INumberInputArgs & IBaseSettingArgs<number>) {
        super(args, NumberInput);
    }
}
