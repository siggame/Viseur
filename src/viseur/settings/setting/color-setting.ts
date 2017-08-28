import { Event } from "src/core/event";
import { ColorPicker, IBaseInputArgs } from "src/core/ui/inputs";
import { BaseSetting } from "./base-setting";

export class ColorSetting extends BaseSetting {
    /** This event is emitted when the value of the setting changes */
    public readonly changed = new Event<string>();

    constructor(args: IBaseInputArgs & {
        /** The default value for the color picker */
        default: string,
    }) {
        super(args, ColorPicker);
    }

    /**
     * Gets the value of the setting
     * both are basically the id so that multiple games (namespaces) can have the same settings key.
     * @param [defaultValue=null] the default value, if there is not setting
     *                                for namespace.key then it is set to def, and returned
     * @returns whatever was stored at this setting
     */
    public get(defaultValue?: string): string {
        return super.get(arguments.length === 0
            ? null
            : defaultValue,
        );
    }

    /**
     * Sets the value of this setting
     * @param  value the new value to store for this setting
     */
    public set(value: string): void {
        super.set(value);
    }
}
