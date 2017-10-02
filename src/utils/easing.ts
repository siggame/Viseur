import * as eases from "eases";

/** Useful map to look up valid easing names for the ease function */
export type ValidEases = ValidEaseNames | ((t: number) => number);
export type ValidEaseNames =
    "backInOut" |
    "backIn" |
    "backOut" |
    "bounceInOut" |
    "bounceIn" |
    "bounceOut" |
    "circInOut" |
    "circIn" |
    "circOut" |
    "cubicInOut" |
    "cubicIn" |
    "cubicOut" |
    "elasticInOut" |
    "elasticIn" |
    "elasticOut" |
    "expoInOut" |
    "expoIn" |
    "expoOut" |
    "linear" |
    "quadInOut" |
    "quadIn" |
    "quadOut" |
    "quartInOut" |
    "quartIn" |
    "quartOut" |
    "quintInOut" |
    "quintIn" |
    "quintOut" |
    "sineInOut" |
    "sineIn" |
    "sineOut";

export function getEasingByName(name: ValidEaseNames): (num: number) => number {
    return eases[name];
}

/**
 * Eases a time number
 * @param t the time to ease
 * @param easing the name of the easing function to use
 * @returns t eased via the easing function
 */
export function ease(t: number, easing?: ValidEases): number;

/**
 * Eases a set of numbers, first and second, along some time t, with an easing function
 * @param first the first number (minimum)
 * @param second the second number (maximum)
 * @param t the time to ease, should be [0, 1]
 * @param easing the name of the easing function to use, or your own custom easing functions
 * @returns a number (probably) between [first, second] that has been eased to time t
 */
export function ease(
    first: number,
    second: number,
    t: number,
    easing?: ValidEases,
): number;

/**
 * Eases a number or numbers
 * @param first the number to ease
 * @param second optional number to ease, or a way to ease first
 * @param t optional time to ease first to second from
 * @param easing optional way to ease first to second along time t
 * @returns a new number, now eased
 */
export function ease(
    first: number,
    second?: number | ValidEases,
    t?: number,
    easing?: ValidEases,
): number {
    if (arguments.length <= 2) {
        // two arguments, so this is a t easing
        easing = typeof(second) === "number"
            ? undefined
            : second;
        t = first;
        first = 0;
        second = 1;
    }
    second = Number(second);
    t = Number(t);

    easing = easing || "cubicInOut";

    if (typeof(easing) === "string") {
        // we need to look up the easing function by name
        easing = getEasingByName(easing);
    }

    t = easing(t);

    return arguments.length <= 2
        ? t
        : first * (1 - t) + second * t;
}

/**
 * Eases a number between 0 to 1 from 0, to 1, and back to 0
 * @param {number} x number to ease, must range from [0, 1]
 * @returns {number} the easing up then down, will range from [0, 1]
 */
export function updown(x: number): number {
    return -4 * (-1 + x) * x;
}
