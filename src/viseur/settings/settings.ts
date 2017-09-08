import { BaseSetting } from "./setting";

/** The base settings interface for viseur/game */
export interface IBaseSettings {
    /** Name lookup for a setting */
    [settingName: string]: BaseSetting<any> | Array<BaseSetting<any>>;
}

/**
 * You MUST call this when creating settings, it's essentially a typed factory.
 * This will take an object of created settings, and formats them.
 * The returned object is a readonly ready to use settings object
 * @param namespace the string used to store the settings in browser
 * @param settings an object of string keys to BaseSetting values
 * @returns settings now formatted for use
 */
export function createSettings<T extends {}>(namespace: string, settings: T): Readonly<T> {
    for (const key of Object.keys(settings)) {
        const obj = (settings as any)[key];
        let someSettings = [ obj ];
        if (Array.isArray(obj)) {
            someSettings = obj;
        }

        for (const setting of someSettings) {
            setting.namespace = namespace;
            setting.set(setting.args.default);
        }
    }

    return Object.freeze(settings);
}
