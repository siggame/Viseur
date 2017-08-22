import * as Color from "color";
import * as PIXI from "pixi.js";
import { colorAsMatrix } from "./color";

/**
 * Gets a PIXI ColorMatrixFilter set to this color
 * @param {Color} color the color to generate the color matrix filter for
 * @returns {PIXI.ColorMatrixFilter} this as a PIXI ColorMatrixFilter
 */
export function getColorMatrixFilterFor(color: Color): PIXI.filters.ColorMatrixFilter {
    const filter = new PIXI.filters.ColorMatrixFilter();
    filter.matrix = colorAsMatrix(color);

    return filter;
}

/**
 * Convenience function. Takes the Container's current scale into account when setting the pivot,
 * so you don't have to have pixel values
 * @param obj the display object to set the pivot for
 * @param relativeX a scalar based on the currently scaled width, so 0.5 is the center
 * @param relativeY a scalar based on the currently scaled height, so 0.5 is the middle
 * @returns the passing obj for chaining
 */
export function setRelativePivot(
    obj: PIXI.Container,
    relativeX: number = 0.5,
    relativeY: number = 0.5,
): PIXI.Container {
    obj.pivot.set(relativeX * obj.width / obj.scale.x, relativeY * obj.height / obj.scale.y);
    return obj;
}
