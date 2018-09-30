import { BaseSetting } from "./setting";

/** The base settings interface for viseur/game */
export interface IBaseSettings {
    /** Name lookup for a setting */
    [settingName: string]: BaseSetting | BaseSetting[];
}

/**
 * You MUST call this when creating settings, it's essentially a typed factory.
 * This will take an object of created settings, and formats them.
 * The returned object is a readonly ready to use settings object
 * @param namespace the string used to store the settings in browser
 * @param settings an object of string keys to BaseSetting values
 * @returns settings now formatted for use
 */
export function createSettings<T extends IBaseSettings>(
    namespace: string,
    settings: T,
): Readonly<T> {
    for (const obj of Object.values(settings)) {
        const someSettings = Array.isArray(obj)
            ? obj
            : [ obj ];

        for (const setting of someSettings) {
            setting.setNamespace(namespace);
        }
    }

    return Object.freeze(settings);
}
