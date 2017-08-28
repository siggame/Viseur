import { EventEmitter } from "events";
import * as store from "store";

export interface ISettingsManagerEvents {
    /** Triggered when a specific id key is changed */
    on(event: "${key}.changed", listener: (newValue: any) => void): this;
}

/** A singleton that manages settings. Get/set and storing in local storage. */
export class SettingsManager extends EventEmitter implements ISettingsManagerEvents {
    /** This instance's namespace */
    public readonly namespace: string;

    /**
     * Creates a new SettingsManager for the given namespace.
     * Keys outside the namespace of this instance are inaccessible
     * @param namespace the namespace of this instance
     */
    constructor(namespace: string) {
        super();

        this.namespace = namespace;
    }

    /**
     * Get the setting at key
     * both are basically the id so that multiple games (namespaces) can have the same settings key.
     * @param {string} key the key in the namespace
     * @param {*} [defaultValue=null] the default value, if there is not setting
     *                                for namespace.key then it is set to def, and returned
     * @returns {*} whatever was stored at namespace.key
     */
    public get(key: string, defaultValue: any = null): any {
        const id = this.getID(key);

        if (store.get(id) === undefined) {
            this.set(key, defaultValue);
            return defaultValue;
        }

        return store.get(id);
    }

    /**
     * Set the setting at namespace.key, both are basically the id so that
     * multiple games (namespaces) can have the same settings key.
     * @param {string} key - the key in the namespace
     * @param {*} value - the new value to store for namespace.key
     */
    public set(key: string, value: any): void {
        const id = this.getID(key);

        if (value === undefined) {
            throw new Error(`undefined is not a valid value for ${id}`);
        }

        store.set(id, value);

        this.emit(`${key}.changed`, value);
    }

    /**
     * Attaches a callback when a setting namespace + key change value
     * @param {string} key - the key in the namespace
     * @param {Function} callback - the callback function
     */
    public onChanged(key: string, callback: (newValue: any) => void): void {
        const id = this.getID(key);

        if (!callback) {
            throw new Error(`No callback for on changed ${id}`);
        }

        this.on(`${key}.changed`, callback);
    }

    /**
     * Check if this SettingsManager has some setting saved (checks for existence)
     * @param {string} key the key in the namespace
     * @returns {Boolean} true if the SettingManager has a value saved for the namespace.key, false otherwise
     */
    public has(key: string): boolean {
        const id = this.getID(key);
        return store.get(id) !== undefined;
    }

    /**
     * Creates a unique id for the namespace and key, basically joins them "namespace.key"
     * @param key the key to get the formatted id for
     * @returns {string} a unique id as a combination of all passed in args
     */
    private getID(key: string): string {
        return `${this.namespace}.${key}`;
    }
}
