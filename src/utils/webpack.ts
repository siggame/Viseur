import { isObject, objectHasProperty } from "@cadre/ts-utils/object";

/**
 * Checks if an imported thing is a loaded resource via FileLoader.
 *
 * @param thing - The imported thing to check.
 * @returns True if a loaded resource indicator, false otherwise.
 */
export function isImportedResource(
    thing: unknown,
): thing is { default: string } {
    return Boolean(
        isObject(thing) &&
            objectHasProperty(thing, "default") &&
            typeof thing.default === "string",
    );
}
