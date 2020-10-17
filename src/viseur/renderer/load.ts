// This is a simple function to be used in games
import { mapValues } from "lodash";
import { FirstArgument, PixiSpriteOptions } from "src/utils";
import { RenderableGameObjectClass } from "src/viseur/game";
import blankPng from "src/viseur/images/blank.png";
import {
    BaseRendererResource,
    BaseRendererResourceOptions,
} from "./base-renderer-resource";
import { RendererResource } from "./renderer-resource";
import { RendererSheetResource, SheetData } from "./renderer-sheet-resource";

/** The base interface all renderer resources implement. */
export interface BaseRendererResources {
    [key: string]: BaseRendererResource | undefined;
}

/** The base resources all games can expect. */
export interface RendererResources extends BaseRendererResources {
    /**
     * A blank (white) sprite for building simple blocks of color.
     * Oddly faster than raster-zing the pixels directly.
     */
    blank: RendererResource;
}

/** The resources for a given game object. */
export type ResourcesForGameObject<T extends BaseRendererResources> = Readonly<
    {
        [K in keyof T]: (
            options?: T[K] extends undefined
                ? never
                : T[K] extends BaseRendererResource
                ? FirstArgument<T[K]["newSprite"]>
                : never,
        ) => PIXI.Sprite;
    }
>;

/** The options for a resource to be loaded for the Renderer. */
export interface ResourceLoadOptions extends BaseRendererResourceOptions {
    /** The sheet data, if present this loads a sprite sheet. */
    sheet?: SheetData;
}

/**
 * Loads a resource for a game given the name of the file and some options.
 *
 * @param texture - The name of the file to load.
 * @param options - The optional object of options about the texture.
 * @returns A renderer resource which is a PIXI.Sprite factory for that resource.
 */
export function load(
    texture: string,
    options?: BaseRendererResourceOptions,
): RendererResource;

/**
 * Loads a resource for a game given the name of the file and sheet options.
 *
 * @param texture - The name of the file to load.
 * @param options - An optional object of options about the texture,
 * if a sheet is present the sheet version will be returned.
 * @returns A renderer resource which is a PIXI.Sprite factory for that resource.
 */
export function load(
    texture: string,
    options: ResourceLoadOptions,
): RendererSheetResource;

/**
 * Loads a resource for a game given the name of the file and some options.
 *
 * @param texture - The name of the file to load.
 * @param options - An optional object of options about the texture,
 * if a sheet is present the sheet version will be returned.
 * @returns A renderer resource which is a PIXI.Sprite factory for that resource.
 */
export function load(
    texture: string,
    options?: ResourceLoadOptions,
): RendererResource | RendererSheetResource {
    const safeTexture = texture.replace("./", ""); // Remove un-needed dir part

    if (options && options.sheet) {
        const sheet = options.sheet;
        delete options.sheet;

        return new RendererSheetResource(safeTexture, sheet, options);
    }

    return new RendererResource(safeTexture, options);
}

/**
 * Creates an object interface of resources for games.
 *
 * @param gameName - The name of the game to create resources for.
 * @param resources - This must be a key/value list, key must be a string, value must be a RendererResource.
 * @returns That same object frozen and extended with the index interface for TS.
 */
export function createResources<T extends BaseRendererResources>(
    gameName: string,
    resources: T,
): Readonly<T & RendererResources> {
    const frozen = Object.freeze({
        blank: new RendererResource(blankPng, { absolute: true }),
        ...(resources as { [key: string]: BaseRendererResource }),
    });

    for (const resource of Object.values(frozen)) {
        // hackish to set private variable publicly
        ((resource as unknown) as { gameName: string }).gameName = gameName;
    }

    return (frozen as unknown) as Readonly<T & RendererResources>;
}

/**
 * Creates a object of resources for a given game object.
 *
 * @param gameObject - The GameObject that gets new sprites added to it its container.
 * @param resources - The resources in the game.
 * @returns A new object of factory functions for the resources and game object.
 */
export function createResourcesFor<T extends BaseRendererResources>(
    gameObject: InstanceType<RenderableGameObjectClass>,
    resources: T,
): ResourcesForGameObject<T> {
    return mapValues(resources, (resource, key) => {
        if (!(resource instanceof BaseRendererResource)) {
            throw new Error(`Resource with key ${key} cannot be undefined`);
        }

        return (options: PixiSpriteOptions): PIXI.Sprite =>
            resource.newSprite({
                container: gameObject.container,
                ...options,
            });
    }) as ResourcesForGameObject<T>;
}
