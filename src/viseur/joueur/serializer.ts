/** functions to serialize and un-serialize json communications strings */

import { isEmptyExceptFor, isObject, UnknownObject } from "src/utils";
import { BaseGame } from "src/viseur/game/base-game";

/**
 * Checks if a given object is strictly a game object reference
 * @param obj the object to check if it only as an id
 * @returns true if appears to be a game object reference, false otherwise
 */
export function isGameObjectReference(obj: object): boolean {
    return isEmptyExceptFor(obj, "id");
}

/**
 * Checks if an objects key is serializable
 * @param obj the object to check
 * @param key the key to check in obj
 * @returns true if it is serializable, false otherwise
 */
export function isSerializable(obj: object, key: string): boolean {
    return isObject(obj) && obj.hasOwnProperty(key);
}

/**
 * Takes an object and returns a clone that is safe to serialize,
 * by transforming game objects into game object references
 * NOTE: Do not send objects with cycles
 * @param data the data to serialize
 * @returns a serialized object safe to send via a joueur
 */
export function serialize(data: unknown): string | number | UnknownObject {
    // then no need to serialize it, it's already json serializable as a string, number, boolean, null, etc.
    if (!isObject(data)) {
        return data as string | number;
    }

    if (data.id) { // no need to serialize this whole game object, send an object reference
        return { id: data.id };
    }

    const serialized = Array.isArray(data) ? [] : {} as UnknownObject;
    for (const key of Object.keys(data)) {
        if (isSerializable(data, key)) {
            serialized[key] = serialize(data[key]);
        }
    }
    return serialized;
}

/**
 * Takes a serialized object and casts game object references back to their game objects
 * @param data the object to deserialize
 * @param game the game that contains game objects
 * @returns a copy of an object safely deserialized
 */
export function deserialize(data: any, game?: BaseGame): any {
    if (isObject(data)) {
        const result = Array.isArray(data) ? [] : {} as UnknownObject;

        for (const key of (Object.keys(data))) {
            const value = data[key];
            if (typeof(value) === "object") {
                // we don't care to deserialize shallow game object references, if we did we'd check so here
                result[key] = deserialize(value);
            }
            else {
                result[key] = value;
            }
        }

        return result;
    }

    return data;
}
