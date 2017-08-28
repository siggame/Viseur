import { ColorPicker, IBaseInputArgs } from "src/core/ui/inputs";
import { BaseSetting } from "./base-setting";

export class ColorSetting extends BaseSetting {
    constructor(args: IBaseInputArgs) {
        super(args, ColorPicker);
    }
}
