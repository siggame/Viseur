import { CheckBox, IBaseInputArgs } from "src/core/ui/inputs";
import { BaseSetting, IBaseSettingArgs } from "./base-setting";

/** A boolean setting controlled via checkbox */
export class CheckBoxSetting extends BaseSetting<boolean> {
    constructor(args: IBaseInputArgs & IBaseSettingArgs<boolean>) {
        super(args, CheckBox);
    }
}
