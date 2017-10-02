import * as Color from "color";

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
