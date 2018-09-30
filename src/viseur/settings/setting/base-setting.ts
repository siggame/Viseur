import { BaseInput, IBaseInputArgs } from "src/core/ui/inputs/base-input";
import * as store from "store";
import { Event } from "ts-typed-events";

/** Additional arguments required for the base setting */
export interface IBaseSettingArgs<T> {
    /** The default value (synonymous with the value key) */
    default: T;
}

/**
 * A base setting represents an input that controls a single setting.
 * This is basically a wrapper around the input's interface args so that
 * we can re-use them to make settings files with compile time type checking.
 */
export abstract class BaseSetting<T = unknown> {
    /** The index of the next new setting. */
    public static newIndex: number = 0;

    /** Event emitted when this setting's value changes. */
    public readonly changed = new Event<T>();

    /** The index this setting is when displaying in order, starting at 0 */
    public readonly index: number;

    /** The default value of this setting */
    public readonly default: T;

    /** The namespace this setting is a part of */
    private namespace: string; // Note, although this is private in the settings

    protected constructor(
        /** Arguments used for this setting to create a base input */
        private readonly args: IBaseSettingArgs<T> & IBaseInputArgs,
        /** The class constructor for this setting's input */
        private readonly inputClass: { new (args: unknown): BaseInput<T> },
    ) {
        this.namespace = "";
        this.index = BaseSetting.newIndex;
        this.default = args.default;

        BaseSetting.newIndex += 1;
    }

    /**
     * Sets the namespace for this setting (after initialization).
     *
     * @param namespace - The new namespace to set us to.
     */
    public setNamespace(namespace: string): void {
        this.namespace = namespace;
        const id = this.getID();

        if (store.get(id) === undefined) {
            // we've never been set! Use our default value
            this.set(this.default);
        }
    }

    /**
     * Creates an input that listens for changes for this event
     * @param parent the parent element for this new input
     * @returns the input for this setting
     */
    public createInput(parent: JQuery): BaseInput<T> {
        const input = new this.inputClass({
            parent,
            value: this.get(),
            ...this.args,
        });

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
     * @returns whatever was stored at namespace.key
     */
    public get(): T {
        const id = this.getID();

        // tslint:disable-next-line:no-unsafe-any - they type it as any
        return this.transformValue(store.get(id));
    }

    /**
     * Set the setting at namespace.key, both are basically the id so that
     * multiple games (namespaces) can have the same settings key.
     * @param value - the new value to store for namespace.key
     */
    public set(value: T): void {
        const id = this.getID();

        if (value === undefined) {
            throw new Error(`undefined is not a valid value for ${id}`);
        }

        const transformed = this.transformValue(value);

        store.set(id, transformed);

        this.changed.emit(transformed);
    }

    /**
     * Optional override to transform the value
     * @param value the value to transform
     * @returns the value transformed
     */
    protected transformValue(value: T): T {
        return value;
    }

    /**
     * Creates a unique id for the namespace and key, basically joins them "namespace.key"
     * @returns a unique id as a combination of all passed in args
     */
    private getID(): string {
        return `${this.namespace}.${this.args.id}`;
    }
}
