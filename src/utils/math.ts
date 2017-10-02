/* Useful mathematical functions */

export interface IPoint {
    /** x coordinate */
    x: number;

    /** y coordinate */
    y: number;
}

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

/**
 * Gets the Manhattan distance between two points (x1, y1) and (x2, y2);
 * the distance between two points measured along axes at right angles.
 * @param {Point} pointA the first point
 * @param {Point} pointB the second point
 * @returns {number} the manhattan distance between the two points.
 */
export function manhattanDistance(pointA: IPoint, pointB: IPoint): number {
    return Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);
}

/**
 * Gets the Euclidean distance between two points (x1, y1) and (x2, y2);
 * Pythagorean theorem: The distance between two points is the length of the path connecting them.
 * @param {Point} pointA the first point
 * @param {Point} pointB the second point
 * @returns {number} the manhattan distance between the two points.
 */
export function euclideanDistance(pointA: IPoint, pointB: IPoint): number {
    return Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));
}

/**
 * sums up all the numbers sent
 * @param numbers numbers to sum
 * @returns the sum of all numbers given
 */
export function sum(...numbers: number[]): number {
    return numbers.reduce((s: number, n: number) => s + n, 0);
}
