import { BaseSetting } from "./setting";

/** The base settings interface for viseur/game. */
export interface BaseSettings {
    /** Name lookup for a setting. */
    [settingName: string]: BaseSetting | BaseSetting[] | undefined;
}

/**
 * You MUST call this when creating settings, it's essentially a typed factory.
 * This will take an object of created settings, and formats them.
 * The returned object is a readonly ready to use settings object.
 *
 * @param namespace - The string used to store the settings in browser.
 * @param settings - An object of string keys to BaseSetting values.
 * @returns Settings now formatted for use.
 */
export function createSettings<T extends BaseSettings>(
    namespace: string,
    settings: T,
): Readonly<T> {
    for (const [key, obj] of Object.entries(settings)) {
        if (!obj) {
            throw new Error(`Setting ${key} cannot be undefined`);
        }

        const someSettings = Array.isArray(obj) ? obj : [obj];

        for (const setting of someSettings) {
            setting.setNamespace(namespace);
        }
    }

    return Object.freeze(settings);
}
