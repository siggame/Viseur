import { BaseInputArgs, ColorPicker } from "src/core/ui/inputs";
import { BaseSetting, BaseSettingArgs } from "./base-setting";

/** Represents a color (hex string) via color input. */
export class ColorSetting extends BaseSetting<string> {
    constructor(args: BaseInputArgs<string> & BaseSettingArgs<string>) {
        super(args, ColorPicker);
    }
}
