import { INumberInputArgs, NumberInput } from "src/core/ui/inputs/number";
import { BaseSetting } from "./base-setting";

export class NumberSetting extends BaseSetting {
    constructor(args: INumberInputArgs) {
        super(args, NumberInput);
    }
}
