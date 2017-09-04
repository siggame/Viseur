import * as eases from "eases";

/** Useful map to look up valid easing names for the ease function */
export type ValidEases =
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

export function getEasingByName(name: ValidEases): (num: number) => number {
    return eases[name];
}

/**
 * Eases a time number
 * @param t the time to ease
 * @param easing the name of the easing function to use
 * @returns t eased via the easing function
 */
export function ease(t: number, easing: ValidEases): number;

/**
 * Eases a set of numbers, first and second, along some time t, with an easing function
 * @param first the first number (minimum)
 * @param second the second number (maximum)
 * @param t the time to ease, should be [0, 1]
 * @param easing the name of the easing function to use, or your own custom easing functions
 * @returns a number (probably) between [first, second] that has been eased to time t
 */
export function ease(first: number, second: number, t: number, easing: ValidEases | ((t: number) => number)): number;

/**
 * Ease implementation
 */
export function ease(
    first: number,
    second: number | ValidEases,
    t?: number,
    easing?: ValidEases | ((t: number) => number),
): number {
    if (typeof(second) === "string" && arguments.length === 2) {
        // two arguments, so this is a t easing
        easing = second;
        t = first;
        first = 0;
        second = 1;
    }
    second = Number(second);
    t = Number(t);

    easing = easing || "backIn";

    if (typeof(easing) === "string") {
        // we need to look up the easing function by name
        easing = getEasingByName(easing);
    }

    t = easing(t);

    return first * (1 - t) + second * t;
}

/**
 * Eases a number between 0 to 1 from 0, to 1, and back to 0
 * @param {number} x number to ease, must range from [0, 1]
 * @return {number} the easing up then down, will range from [0, 1]
 */
export function updown(x: number): number {
    return -4 * (-1 + x) * x;
}