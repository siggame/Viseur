import { euclideanDistance, Point } from "@cadre/ts-utils";
import * as Color from "color";
import * as PIXI from "pixi.js";
import { ease } from "./easing";

/** The possible types that can be used for PIXI tints. */
export type ColorTint = Color | number | string;

/** Options that can be used in the create sprite util functions. */
export interface PixiSpriteOptions {
    /** The container to put the sprite into. */
    container?: PIXI.Container;

    /** The width to set the sprite to. */
    width?: number;

    /** The height to set the sprite to. */
    height?: number;

    /** The rotation to set the sprite to (in radians). */
    rotation?: number;

    /** The position of the sprite. */
    position?: number | Point;

    /** The skew of the sprite. */
    skew?: Point;

    /** The pivot position for the sprite. */
    pivot?: number | Point;

    /** The color to tint the sprite. */
    tint?: ColorTint;

    /** The relative pivot as either a single number used for the x and y, or the tuple. */
    relativePivot?: number | Point;

    /** Sets the blend mode. */
    blendMode?: number;

    /** The alpha value (opacity) of the sprite. */
    alpha?: number;

    /** A name to attach to the new sprite. */
    name?: string;

    /** If set toggles visibility. */
    visible?: boolean;

    /** The anchor for this sprite. */
    anchor?: number | Point;

    /** The scale, multiplied byt he current scale instead of static. */
    relativeScale?: number | Point;

    /** A callback for if this sprite is clicked. */
    onClick?(): void;
}

/**
 * Gets a tint number from a color like variable.
 *
 * @param color - A color like variable, can be the number (passed through),
 * string color name, or the Color instance.
 * @returns A number that represents a color tint, such as 0xFF000 for red.
 * @example Color("red") -> 0xFF000
 */
export function getTintFromColor(color: ColorTint): number {
    if (typeof color === "number") {
        return color;
    } else if (typeof color === "string") {
        return Color(color).rgbNumber();
    } else {
        return color.rgbNumber();
    }
}

/**
 * Sets the properties of a pixi sprite from an options interface.
 *
 * @param sprite - The sprite to set properties on.
 * @param options - The options to set the properties from.
 */
export function setPixiOptions(
    sprite: PIXI.Sprite | PIXI.Container,
    options: Readonly<PixiSpriteOptions>,
): void {
    if (options.container) {
        sprite.setParent(options.container);
    }

    if (options.width !== undefined) {
        sprite.width = options.width;
    }

    if (options.height !== undefined) {
        sprite.height = options.height;
    }

    if (options.rotation !== undefined) {
        sprite.rotation = options.rotation;
    }

    let x: number;
    let y: number;
    if (options.position !== undefined) {
        if (typeof options.position === "number") {
            x = options.position;
            y = options.position;
        } else {
            x = options.position.x;
            y = options.position.y;
        }
        sprite.position.set(x, y);
    }

    if (options.skew !== undefined) {
        if (typeof options.skew === "number") {
            x = options.skew;
            y = options.skew;
        } else {
            x = options.skew.x;
            y = options.skew.y;
        }
        sprite.skew.set(x, y);
    }

    if (options.pivot !== undefined) {
        if (typeof options.pivot === "number") {
            x = options.pivot;
            y = options.pivot;
        } else {
            x = options.pivot.x;
            y = options.pivot.y;
        }
        sprite.pivot.set(x, y);
    }

    if (options.alpha !== undefined) {
        sprite.alpha = options.alpha;
    }

    if (sprite instanceof PIXI.Sprite) {
        if (options.tint !== undefined) {
            sprite.tint = getTintFromColor(options.tint);
        }

        if (options.blendMode !== undefined) {
            sprite.blendMode = options.blendMode;
        }
    }

    if (options.relativePivot !== undefined) {
        if (typeof options.relativePivot === "number") {
            x = options.relativePivot;
            y = options.relativePivot;
        } else {
            x = options.relativePivot.x;
            y = options.relativePivot.y;
        }
        setRelativePivot(sprite, x, y);
    }

    if (options.alpha !== undefined) {
        sprite.alpha = options.alpha;
    }

    if (options.name !== undefined) {
        sprite.name = options.name;
    }

    if (options.onClick !== undefined) {
        sprite.interactive = true;
        sprite.on("mouseupoutside", options.onClick);
        sprite.on("mouseup", options.onClick);
        sprite.on("touchend", options.onClick);
        sprite.on("touchendoutside", options.onClick);
        sprite.on("rightup", options.onClick);
        sprite.on("rightupoutside", options.onClick);
    }

    if (options.visible !== undefined) {
        sprite.visible = options.visible;
    }

    if (options.relativeScale) {
        if (typeof options.relativeScale === "number") {
            x = options.relativeScale;
            y = options.relativeScale;
        } else {
            x = options.relativeScale.x;
            y = options.relativeScale.y;
        }

        sprite.scale.x *= x;
        sprite.scale.y *= y;
    }

    if (options.anchor) {
        if (typeof options.anchor === "number") {
            x = options.anchor;
            y = options.anchor;
        } else {
            x = options.anchor.x;
            y = options.anchor.y;
        }

        if (sprite instanceof PIXI.Sprite) {
            sprite.anchor.set(x, y);
        }
    }
}

/**
 * Convenience function. Takes the Container's current scale into account when setting the pivot,
 * so you don't have to have pixel values.
 *
 * @param obj - The display object to set the pivot for.
 * @param relativeX - A scalar based on the currently scaled width, so 0.5 is the center.
 * @param relativeY - A scalar based on the currently scaled height, so 0.5 is the middle.
 * @returns The passing obj for chaining.
 */
export function setRelativePivot(
    obj: PIXI.Container | PIXI.Sprite,
    relativeX = 0.5,
    relativeY = 0.5,
): PIXI.Container {
    obj.pivot.set(
        (relativeX * obj.width) / obj.scale.x,
        (relativeY * obj.height) / obj.scale.y,
    );

    return obj;
}

/**
 * Takes a sprite and "stretches" it between two points along it's width,
 * useful for beam type effects.
 *
 * @param sprite - The sprite to use. Assumed to be 1x1 units by default.
 * It's width and pivot will be scaled for the stretching.
 * @param pointA - The first point, an object with an {x, y} to derive coordinates from.
 * @param pointB - The second point, an object with an {x, y} to derive coordinates from.
 */
export function renderSpriteBetween(
    sprite: PIXI.Sprite,
    pointA: Readonly<Point>,
    pointB: Readonly<Point>,
): void {
    const distance = euclideanDistance(pointA, pointB);
    sprite.width = distance;
    setRelativePivot(sprite, 0.5, 0.5);

    const angleRadians = Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x);
    sprite.rotation = angleRadians;

    const midX = (pointA.x + pointB.x) / 2;
    const midY = (pointA.y + pointB.y) / 2;
    sprite.position.set(midX + 0.5, midY + 0.5);
}

/**
 * Takes a sprite, renders it at a given point, and then rotates it towards
 * another point.
 *
 * @param sprite - The sprite to use. Assumed to be 1x1 units by default.
 * It's width and pivot will be scaled for the stretching.
 * @param pointA - The first point, an object with an {x, y} to derive coordinates from.
 * @param pointB - The second point, an object with an {x, y} to derive coordinates from.
 */
export function renderSpriteRotatedTowards(
    sprite: PIXI.Sprite,
    pointA: Readonly<Point>,
    pointB: Readonly<Point>,
): void {
    setRelativePivot(sprite, 0.5, 0.5);

    const angleRadians = Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x);
    sprite.rotation = angleRadians;

    sprite.position.set(pointA.x, pointA.y);
}

/**
 * Fades a given PIXI.container's in or out based on some dt given a direction to fade.
 * Takes a current and next number to determine if they should fade in, out, be hidden, or shown.
 * - Both > 0 :: fully visible all the time
 * - Both = 0 :: fully invisible all the time
 * - Current != 0, Next = 0 :: fade out
 * - Next != 0, Current = 0 :: fade in.
 *
 * @param sprite - The sprite to fade in or out.
 * @param dt - The current amount to fade in or out [0, 1). ) means no fade, 0.9999 would be almost fully faded.
 * @param current - The current number.
 * @param next - The next number.
 */
export function pixiFade(
    sprite: PIXI.Container,
    dt: number,
    current: number,
    next: number,
): void {
    if (current === 0 && next === 0) {
        // hide
        sprite.alpha = 0;
    } else if (current !== 0 && next !== 0) {
        // show
        sprite.alpha = 1;
    } else if (current === 0 && next !== 0) {
        // fade in
        sprite.alpha = ease(dt);
    } else {
        // must be fade out
        sprite.alpha = ease(1 - dt);
    }
}

export const printPoint = ({ x, y }: Point): string => `{ x: ${x}, y: ${y} }`;
