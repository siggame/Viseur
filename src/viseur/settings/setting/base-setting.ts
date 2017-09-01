import { Event } from "src/core/event";
import { BaseInput, IBaseInputArgs } from "src/core/ui/inputs/base-input";
import * as store from "store";

/** Additional arguments required for the base setting */
export interface IBaseSettingArgs {
    /** The default value (synonymous with the value key) */
    default: any;
}

/**
 * A base setting represents an input that controls a single setting.
 * This is basically a wrapper around the input's interface args so that
 * we can re-use them to make settings files with compile time type checking
 */
export abstract class BaseSetting {
    /** The index of the next new setting */
    public static newIndex: number = 0;

    /** Event emitted when this setting's value changes */
    public readonly changed = new Event<any>();

    /** The index this setting is when displaying in order, starting at 0 */
    public readonly index: number;

    /** The namespace this setting is a part of */
    private readonly namespace: string; // Note, although this is private in the settings
                                        // generator function we will change this

    protected constructor(
        /** Arguments used for this setting to create a base input */
        public readonly args: IBaseInputArgs & IBaseSettingArgs,
        /** The class constructor for this setting's input */
        public readonly inputClass: typeof BaseInput,
    ) {
        this.namespace = "";
        this.index = BaseSetting.newIndex;

        BaseSetting.newIndex += 1;
    }

    /**
     * Get the setting at key
     * both are basically the id so that multiple games (namespaces) can have the same settings key.
     * @param {*} [defaultValue=null] the default value, if there is not setting
     *                                for namespace.key then it is set to def, and returned
     * @returns {*} whatever was stored at namespace.key
     */
    public get(defaultValue: any = null): any {
        const id = this.getID();
        if (store.get(id) === undefined) {
            this.set(defaultValue);
            return defaultValue;
        }

        return store.get(id);
    }

    /**
     * Set the setting at namespace.key, both are basically the id so that
     * multiple games (namespaces) can have the same settings key.
     * @param {*} value - the new value to store for namespace.key
     */
    public set(value: any): void {
        const id = this.getID();

        if (value === undefined) {
            throw new Error(`undefined is not a valid value for ${id}`);
        }

        store.set(id, value);

        this.changed.emit(value as any);
    }

    /**
     * Creates a unique id for the namespace and key, basically joins them "namespace.key"
     * @returns {string} a unique id as a combination of all passed in args
     */
    private getID(): string {
        return `${this.namespace}.${this.args.id}`;
    }
}
