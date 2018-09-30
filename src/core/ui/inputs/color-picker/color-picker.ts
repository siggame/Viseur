import * as Color from "color";
import { BaseInput, IBaseInputArgs } from "../base-input";
import "./color-picker.scss";

/** An input for colors */
export class ColorPicker extends BaseInput<string> {
    /**
     * Initializes the Number Input
     * @param args - initialization args
     */
    constructor(args: IBaseInputArgs) {
        super(Object.assign({
            type: "color",
        }, args));
    }

    /**
     * Sets the value to a new color (if valid), otherwise defaults to white
     */
    public set value(newValue: string) {
        let parsedColor: Color;
        try {
            parsedColor = Color(newValue);
        }
        catch (err) {
            // that color is invalid, reset to white
            parsedColor = Color("white");
        }

        // for some reason the ts bindings for color lack a lot of the actual methods
        const value = parsedColor.hex();
        super.value = value;
        this.element.attr("title", value);
    }
}
