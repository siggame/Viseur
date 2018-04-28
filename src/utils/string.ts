/** Used for html character entity lookups */
interface IEntityObject {
    [key: string]: string;
}

/* Contains useful string related functions */

/**
 * Tries to cast a string to a primitive value if it looks like one
 * @param value the value to try to cast. Will only work on strings.
 * @returns value as a number if it appears to be a number,
 *          or value as a boolean if it appears to be 'true' or 'false',
 *          or just value back as a string
 */
export function unstringify(value: string | number | boolean | null): string | number | boolean | null {
    if (typeof(value) === "string") {
        switch (value.toUpperCase()) { // check for booleans
            case "TRUE":
                return true;
            case "FALSE":
                return false;
            case "NULL":
                return null;
        }

        // check if number
        const asNumber = Number(value);
        if (!isNaN(asNumber)) {
            return asNumber;
        }

        // looks like a string after all
    }

    return value;
}

/**
 * Converts a string in normal case (spaces) to camelCase
 * @param str the string to convert to camel case
 * @returns str now in camel case format
 * @example 'this neat variable' -> 'thisNeatVariable'
 */
export function toCamelCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (matched, index) => {
        if (+matched === 0) {
            return ""; // or if (/\s+/.test(match)) for white spaces
        }
        return index === 0 ? matched.toLowerCase() : matched.toUpperCase();
    });
}

/**
 * Converts a string from camelCase to dash-case
 * @param str string in camelCase format to convert to dash-case
 * @returns str but now in dash-case
 * @example 'thisNeatVariable' -> 'this-neat-variable'
 */
export function toDashCase(str: string): string {
    if (!str) {
        return "";
    }

    // ensure the first character is lower-cased
    str = str[0].toLowerCase() + str.substr(1);

    // and there are no spaces
    str = replaceAll(str, " ", "");

    return str.replace(/([A-Z])/g, (sub) => "-" + sub.toLowerCase());
}

/**
 * Puts escape characters in front of any non escaped characters
 * @param str the string to escape
 * @returns str now escaped
 */
export function escapeRegExp(str: string): string {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

/**
 * Replaces all instances of a search string in a target string with an optional
 * replacement string
 * @param target the target string to search for substrings to replace in
 * @param search the substring to search for in target
 * @param replacement optional replacement string to replace instances of search
 *                    with
 * @returns a string with ALL occurrences of search within target replaced with
 *          the replacement string
 */
export function replaceAll(target: string, search: string, replacement: string = ""): string {
    return target.replace(new RegExp(escapeRegExp(search), "g"), replacement);
}

const validURL = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
/**
 * Validates that a string is a valid url
 * @param {string} str the string to try to validate
 * @returns {boolean} true if looks like a valid url, false otherwise
 */
export function validateURL(str: string): boolean {
    return validURL.test(str);
}

const htmlEntityMap: IEntityObject = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
};

const htmlAttributeEntityMap: IEntityObject = {
    "\"": "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
};

/**
 * Escapes a string to be displayed in HTML, but not AS HTML.
 * @param {string} str the string to escape
 * @param {boolean} escapeAttributes if characters in attributes should be escapes as well
 * @returns {string} str now escaped
 */
export function escapeHTML(str: string, escapeAttributes: boolean = false): string {
    let htmlEscaped = String(str).replace(/[&<>]/g, (s) => htmlEntityMap[s]);

    if (escapeAttributes) {
        htmlEscaped = htmlEscaped.replace(/["'\/]/g, (s) => htmlAttributeEntityMap[s]);
    }

    return htmlEscaped;
}

/**
 * Capitalizes the first character in a string, and no others
 * @param str the string to capitalize
 * @returns str with the first character now uppercase
 */
export function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Un-capitalizes the first character in a string, and no others
 * @param str the string to un-capitalize
 * @returns str with the first character now lowercase
 */
export function unCapitalizeFirstLetter(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
}
