import * as eases from "eases";

/** Useful map to look up valid easing names for the ease function. */
export type ValidEases = ValidEaseNames | ((t: number) => number);

/** The names of eases. */
export type ValidEaseNames = keyof typeof eases;

/**
 * Eases a time number.
 *
 * @param t - The time to ease.
 * @param easing - The name of the easing function to use.
 * @returns T eased via the easing function.
 */
export function ease(t: number, easing?: ValidEases): number;

/**
 * Eases a set of numbers, first and second, along some time t,
 * with an easing function.
 *
 * @param first - The first number (minimum).
 * @param second - The second number (maximum).
 * @param t - The time to ease, should be [0, 1].
 * @param easing - The name of the easing function to use, or your own custom
 * easing functions.
 * @returns A number (probably) between [first, second] that has been eased to
 * time t.
 */
export function ease(
    first: number,
    second: number,
    t: number,
    easing?: ValidEases,
): number;

/**
 * Eases a number or numbers.
 *
 * @param first - The number to ease.
 * @param second - Optional number to ease, or a way to ease first.
 * @param time - Optional time to ease first to second from.
 * @param easing - Optional way to ease first to second along time t.
 * @returns A new number, now eased.
 */
export function ease(
    first: number,
    second?: number | ValidEases,
    time?: number,
    easing?: ValidEases,
): number {
    let a = first;
    let b = second;
    let t = time;
    let e = easing;

    if (arguments.length <= 2) {
        // two arguments, so this is a t easing
        e = typeof second === "number" ? undefined : second;
        t = first;
        a = 0;
        b = 1;
    }
    b = Number(b);
    t = Number(t);

    e = e || "cubicInOut";

    if (typeof e === "string") {
        // we need to look up the easing function by name
        e = eases[e];
    }

    if (e) {
        t = e(t);
    }

    return arguments.length <= 2 ? t : a * (1 - t) + b * t;
}

/**
 * Eases a number between 0 to 1 from 0, to 1, and back to 0.
 *
 * @param x - Number to ease, must range from [0, 1].
 * @returns The easing up then down, will range from [0, 1].
 */
export function updown(x: number): number {
    return (x - 1) * x * -4;
}
