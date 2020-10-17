import * as Color from "color";

/**
 * Gets the most contrasting color (black or white) relative to this color.
 * Useful for text on this color as a background color.
 *
 * @param color - The color to get the contrasting color for.
 * @returns Either black or white as a Color instance.
 */
export function getContrastingColor(color: Color): Color {
    return color.isLight() ? Color("black") : Color("white");
}
