/** Functions to serialize and un-serialize json communications strings. */

import { isObject, objectHasProperty, UnknownObject } from "src/utils";
import { BaseGame } from "src/viseur/game/base-game";

/**
 * Checks if an objects key is serializable.
 *
 * @param obj - The object to check.
 * @param key - The key to check in obj.
 * @returns True if it is serializable, false otherwise.
 */
export function isSerializable(
    obj: Record<string, unknown>,
    key: string,
): boolean {
    return isObject(obj) && objectHasProperty(obj, key);
}

/**
 * Takes an object and returns a clone that is safe to serialize,
 * by transforming game objects into game object references.
 * NOTE: Do not send objects with cycles.
 *
 * @param data - The data to serialize.
 * @returns A serialized object safe to send via a joueur.
 */
export function serialize(
    data: unknown,
): string | number | { [key: string]: string | number } {
    // Then no need to serialize it, it's already json serializable as a
    // string, number, boolean, null, etc.
    if (!isObject(data)) {
        return data as string | number;
    }

    if (data.id) {
        // No need to serialize this whole game object,
        // just send an object reference
        return { id: String(data.id) };
    }

    const serialized: UnknownObject = Array.isArray(data)
        ? ([] as Record<number, unknown>)
        : {};
    for (const key of Object.keys(data)) {
        if (isSerializable(data, key)) {
            serialized[key] = serialize(data[key]);
        }
    }

    return serialized as { [key: string]: string | number };
}

/**
 * Takes a serialized object and casts game object references back to their
 * game objects.
 *
 * @param data - The object to deserialize.
 * @param game - The game that contains game objects.
 * @returns A copy of an object safely deserialized.
 */
export function deserialize<T extends unknown>(data: T, game?: BaseGame): T {
    if (isObject(data)) {
        // TODO: check for game object reference?
        const result: UnknownObject = Array.isArray(data)
            ? ([] as Record<number, unknown>)
            : {};

        for (const key of Object.keys(data)) {
            result[key] = deserialize((data as UnknownObject)[key], game);
        }

        return result as T;
    }

    return data;
}
