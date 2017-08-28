import { Event } from "src/core/event";
import { INumberInputArgs, NumberInput } from "src/core/ui/inputs/number";
import { BaseSetting } from "./base-setting";

export class NumberSetting extends BaseSetting {
    /** This event is emitted when the value of the setting changes */
    public readonly changed = new Event<number>();

    constructor(args: INumberInputArgs & {
        /** The default value for the number input */
        default: number,
    }) {
        super(args, NumberInput);
    }

    /**
     * Gets the value of the setting
     * both are basically the id so that multiple games (namespaces) can have the same settings key.
     * @param [defaultValue=null] the default value, if there is not setting
     *                                for namespace.key then it is set to def, and returned
     * @returns whatever was stored at this setting
     */
    public get(defaultValue?: number): number {
        return super.get(arguments.length === 0
            ? null
            : defaultValue,
        );
    }

    /**
     * Sets the value of this setting
     * @param  value the new value to store for this setting
     */
    public set(value: number): void {
        super.set(value);
    }
}
