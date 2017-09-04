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
    public readonly namespace: string; // Note, although this is private in the settings
                                        // generator function we will change this

    /** The default value of this setting */
    public readonly default: any;

    protected constructor(
        /** Arguments used for this setting to create a base input */
        private readonly args: IBaseInputArgs & IBaseSettingArgs,
        /** The class constructor for this setting's input */
        private readonly inputClass: typeof BaseInput,
    ) {
        this.namespace = "";
        this.index = BaseSetting.newIndex;
        this.default = args.default;

        BaseSetting.newIndex += 1;
    }

    /**
     * Creates an input that listens for changes for this event
     * @param parent the parent element for this new input
     * @returns the input for this setting
     */
    public createInput(parent: JQuery<HTMLElement>): BaseInput<any> {
        const input = new this.inputClass(Object.assign({
            parent,
            value: this.get(),
        }, this.args));

        let changing = false;
        this.changed.on((value) => {
            if (changing) {
                return; // don't start an endless cycle between these two listeners
            }
            changing = true;
            input.value = value;
            changing = false;
        });
        input.events.changed.on((value) => {
            if (changing) {
                return; // don't start an endless cycle between these two listeners
            }
            changing = true;
            this.set(value);
            changing = false;
        });

        return input;
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