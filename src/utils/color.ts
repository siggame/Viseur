import * as Color from "color";

/**
 * An extension that converts the color's hex string to a hex number
 * @param {Color} color the color to get the hex number for
 * @returns {number} the color as a hex number
 * @example #FFCC00 -> 0xFFCC00 === 16763904
 */
export function colorAsHexNumber(color: Color): number {
    // remove "#", then convert from string to int base 16
    return parseInt(color.hex().replace(/^#/, ""), 16);
}

/**
 * Gets a 4x4 color matrix for ColorMatrixFilter operations.
 * Assumes r at 0,0, g, at 1,1, b at 2,2, and a at 3,3, rest are 0s.
 * @param {Color} color the color to get the matrix for
 * @returns an array of 16 numbers, representing a 4x4 color matrix of this color
 */
export function colorAsMatrix(color: Color): number[] {
    const r = color.red() / 255;
    const g = color.green() / 255;
    const b = color.blue() / 255;
    const a = color.alpha();

    return [
        r, 0, 0, 0,
        0, g, 0, 0,
        0, 0, b, 0,
        0, 0, 0, a,
    ];
}

/**
 * Gets the most contrasting color (black or white) relative to this color.
 * Useful for text on this color as a background color
 * @param {Color} color the color to get the contrasting color for
 * @returns {Color} either black or white
 */
export function getContrastingColor(color: Color): Color {
    return color.light()
        ? Color("black")
        : Color("white");
}
