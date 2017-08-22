/* Useful mathematical functions */

/**
 * Clamps a number between a given minimum and maximum value
 * @param val the value to clamp
 * @param min the minimum value to clamp val on the lower bounds
 * @param max the maximum value to clamp val on the upper bounds
 * @returns min if val is too low, max if val is too high, otherwise val
 */
export function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}
