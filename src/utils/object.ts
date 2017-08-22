/* object related utility functions */

/**
 * Checks if the given variable is a javascript object
 * @param obj the object to check, can be anything
 * @returns {boolean} true if an object which is not null, false otherwise
 */
export function isObject(obj: any): boolean {
    return obj !== null && typeof(obj) === "object";
}

/**
 * Traverses down a tree like object via list of keys
 * @param obj tree like object with nested properties to traverse
 * @param keys list of keys to traverse, in order
 * @returns whatever value is at the end of the keys path
 * @throws {Error} throws an error when a given key is not found in the object traversing
 */
export function traverse(obj: any, keys: string[]): any {
    if (!isObject(obj)) {
        throw new Error(`obj ${obj} is not an object to traverse.`);
    }

    for (const key of keys) {
        if (Object.hasOwnProperty.call(obj, key)) {
            obj = obj[key];
        }
        else {
            throw new Error(`Key ${key} not found in object to traverse`);
        }
    }

    return obj;
}
