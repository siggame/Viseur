import { ColorPicker, IBaseInputArgs } from "src/core/ui/inputs";
import { BaseSetting, IBaseSettingArgs } from "./base-setting";

/** Represents a color (hex string) via color input. */
export class ColorSetting extends BaseSetting<string> {
    constructor(args: IBaseInputArgs<string> & IBaseSettingArgs<string>) {
        super(args, ColorPicker);
    }
}
