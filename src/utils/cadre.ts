import { isObject, UnknownObject } from "cadre-ts-utils";

/**
 * Checks if an object has a given key in it that appears to be a game object or game object reference.
 *
 * @param obj - The object to inspect.
 * @param name - The property name in obj to look for.
 * @param id - The given ID to check for, if not the same returns false.
 * @returns True if all the above match, false otherwise.
 */
export function hasGameObjectWithID<
    TObj extends UnknownObject,
    TName extends string,
    TID extends string,
>(
    obj: TObj,
    name: TName,
    id: TID,
): obj is TObj & ({ [K in TName]: { id: TID } }) {
    const gameObject = obj[name];
    if (!isObject(gameObject)) {
        return false;
    }

    return gameObject.id === id;
}
