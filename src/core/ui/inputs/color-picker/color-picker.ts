import * as Color from "color";
import { Immutable } from "src/utils";
import { BaseInput, BaseInputArgs } from "../base-input";
import "./color-picker.scss";

/** An input for colors. */
export class ColorPicker extends BaseInput<string> {
    /**
     * Initializes the Color Picker Input, which only allows hex color strings.
     *
     * @param args - The initialization args.
     */
    constructor(args: Immutable<BaseInputArgs<string>>) {
        super({
            type: "color",
            ...args,
        });
    }

    /**
     * Sets the value to a new color (if valid), otherwise defaults to white.
     */
    public set value(newValue: string) {
        let parsedColor: Color;
        try {
            parsedColor = Color(newValue);
        } catch (err) {
            // that color is invalid, reset to white
            parsedColor = Color("white");
        }

        const value = parsedColor.hex();
        super.value = value;
        this.element.attr("title", value);
    }
}
