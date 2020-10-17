import { BaseInputArgs, CheckBox } from "src/core/ui/inputs";
import { BaseSetting, BaseSettingArgs } from "./base-setting";

/** A boolean setting controlled via checkbox. */
export class CheckBoxSetting extends BaseSetting<boolean> {
    constructor(args: BaseInputArgs<boolean> & BaseSettingArgs<boolean>) {
        super(args, CheckBox);
    }
}
