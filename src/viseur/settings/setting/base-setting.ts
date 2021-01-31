import { Constructor } from "@cadre/ts-utils";
import { BaseInput, BaseInputArgs } from "src/core/ui/inputs/base-input";
import * as store from "store";
import { createEventEmitter } from "ts-typed-events";

/** Additional arguments required for the base setting. */
export interface BaseSettingArgs<T> {
    /** The default value (synonymous with the value key). */
    default: T;
}

/**
 * A base setting represents an input that controls a single setting.
 * This is basically a wrapper around the input's interface args so that
 * we can re-use them to make settings files with compile time type checking.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class BaseSetting<T = any> {
    /** The index of the next new setting. */
    public static newIndex = 0;

    /** Emitter for changed event. */
    private readonly emitChanged = createEventEmitter<T>();

    /** Event emitted when this setting's value changes. */
    public readonly changed = this.emitChanged.event;

    /** The index this setting is when displaying in order, starting at 0. */
    public readonly index: number;

    /** The default value of this setting. */
    public readonly default: T;

    /** The namespace this setting is a part of. */
    private namespace: string; // Note: this is private in the settings

    /**
     * Creates a setting for a given input type.
     *
     * @param args - Arguments used for this setting to create a base input.
     * @param inputClass - The class constructor for this setting's input.
     */
    protected constructor(
        private readonly args: BaseSettingArgs<T> & BaseInputArgs<T>,
        private readonly inputClass: Constructor<BaseInput<T>>,
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
     * Creates an input that listens for changes for this event.
     *
     * @param parent - The parent element for this new input.
     * @returns The input for this setting.
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
                // don't start an endless cycle between these two listeners
                return;
            }
            changing = true;
            input.value = value;
            changing = false;
        });
        input.eventChanged.on((value) => {
            if (changing) {
                // don't start an endless cycle between these two listeners
                return;
            }
            changing = true;
            this.set(value);
            changing = false;
        });

        return input;
    }

    /**
     * Get the setting at key.
     *
     * Both are basically the id so that multiple games (namespaces) can have
     * the same settings keys.
     *
     * @returns Whatever was stored at namespace.key.
     */
    public get(): T {
        const id = this.getID();
        return this.transformValue(store.get(id));
    }

    /**
     * Set the setting at namespace.key, both are basically the id so that
     * multiple games (namespaces) can have the same settings key.
     *
     * @param value - The new value to store for namespace.key.
     */
    public set(value: T): void {
        const id = this.getID();

        if (value === undefined) {
            throw new Error(`undefined is not a valid value for ${id}`);
        }

        const transformed = this.transformValue(value);

        store.set(id, transformed);

        this.emitChanged(transformed);
    }

    /**
     * Optional override to transform the value.
     *
     * @param value - The value to transform.
     * @returns The value transformed.
     */
    protected transformValue(value: T): T {
        return value;
    }

    /**
     * Creates a unique id for the namespace and key, basically joins them
     * "namespace.key".
     *
     * @returns A unique id as a combination of all passed in args.
     */
    private getID(): string {
        return `${this.namespace}.${String(this.args.id)}`;
    }
}
