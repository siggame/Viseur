import { CheckBox, IBaseInputArgs } from "src/core/ui/inputs";
import { BaseSetting } from "./base-setting";

export class CheckBoxSetting extends BaseSetting {
    constructor(args: IBaseInputArgs) {
        super(args, CheckBox);
    }
}
