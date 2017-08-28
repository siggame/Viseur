import { Event } from "src/core/event";
import { CheckBox, IBaseInputArgs } from "src/core/ui/inputs";
import { BaseSetting } from "./base-setting";

export class CheckBoxSetting extends BaseSetting {
    /** This event is emitted when the value of the setting changes */
    public readonly changed = new Event<boolean>();

    constructor(args: IBaseInputArgs & {
        /** The default value for the checkbox, true if checked, false otherwise */
        default: boolean,
    }) {
        super(args, CheckBox);
    }

    /**
     * Gets the value of the setting
     * both are basically the id so that multiple games (namespaces) can have the same settings key.
     * @param [defaultValue=null] the default value, if there is not setting
     *                                for namespace.key then it is set to def, and returned
     * @returns whatever was stored at this setting
     */
    public get(defaultValue?: boolean): boolean {
        return super.get(arguments.length === 0
            ? null
            : defaultValue,
        );
    }

    /**
     * Sets the value of this setting
     * @param  value the new value to store for this setting
     */
    public set(value: boolean): void {
        super.set(value);
    }
}
