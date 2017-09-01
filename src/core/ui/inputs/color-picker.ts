import * as Color from "color";
import { Event, events } from "src/core/event";
import { BaseInput, IBaseInputArgs } from "./base-input";

/** An input for colors */
export class ColorPicker extends BaseInput {
    /** Events this class emits */
    public readonly events = events({
        /** Emitted when this input's value changes */
        changed: new Event<string>(),
    });

    /**
     * Initializes the Number Input
     * @param {object} args - initialization args
     */
    constructor(args: IBaseInputArgs) {
        super(Object.assign({
            type: "color",
        } as IBaseInputArgs, args));
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
        super.value = parsedColor.hex();
    }
}
