// This is a simple function to be used in games
import mapValues from "lodash/mapValues";
import { FirstArgument, IPixiSpriteOptions, Omit } from "src/utils";
import { RenderableGameObjectClass } from "src/viseur/game";
import blankPng from "src/viseur/images/blank.png"; // tslint:disable-line:match-default-export-name
import { BaseRendererResource, IBaseRendererResourceOptions } from "./base-renderer-resource";
import { RendererResource } from "./renderer-resource";
import { ISheetData, RendererSheetResource } from "./renderer-sheet-resource";

/** The base interface all renderer resources implement. */
export interface IBaseRendererResources {
    [key: string]: BaseRendererResource | undefined;
}

/** The base resources all games can expect. */
export interface IRendererResources extends IBaseRendererResources {
    blank: RendererResource;
}

/** The resources for a given game object. */
export type ResourcesForGameObject<T extends IBaseRendererResources> = Readonly<{
    [K in keyof T]: (options?: T[K] extends undefined
        ? undefined
        : T[K] extends BaseRendererResource
            ? Omit<FirstArgument<T[K]["newSprite"]>, "container"> & { container?: PIXI.Container }
            : never,
    ) => PIXI.Sprite;
}>;

/** The options for a resource to be loaded for the Renderer. */
export interface IResourceLoadOptions extends IBaseRendererResourceOptions {
    /** The sheet data, if present this loads a sprite sheet */
    sheet?: ISheetData;
}

/**
 * Loads a resource for a game given the name of the file and some options.
 *
 * @param texture - The name of the file to load.
 * @param options - The optional object of options about the texture.
 * @returns A renderer resource which is a PIXI.Sprite factory for that resource.
 */
export function load(texture: string, options?: IBaseRendererResourceOptions): RendererResource;

/**
 * Loads a resource for a game given the name of the file and sheet options.
 *
 * @param texture - The name of the file to load.
 * @param options - An optional object of options about the texture,
 * if a sheet is present the sheet version will be returned.
 * @returns A renderer resource which is a PIXI.Sprite factory for that resource.
 */
export function load(texture: string, options: IResourceLoadOptions): RendererSheetResource;

/**
 * Loads a resource for a game given the name of the file and some options.
 *
 * @param texture - The name of the file to load.
 * @param options - An optional object of options about the texture,
 * if a sheet is present the sheet version will be returned.
 * @returns a renderer resource which is a PIXI.Sprite factory for that resource
 */
export function load(texture: string, options?: IResourceLoadOptions,
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
 * @param resources - This must be a key/value list, key must be a string, value must be a RendererResource
 * @returns That same object frozen and extended with the index interface for TS.
 */
export function createResources<T extends IBaseRendererResources>(
    gameName: string,
    resources: T,
): Readonly<T & IRendererResources> {
    const frozen = Object.freeze({
        blank: new RendererResource(blankPng, { absolute: true }),
        ...(resources as { [key: string]: BaseRendererResource }),
    });

    for (const resource of Object.values(frozen)) {
        // tslint:disable-next-line:no-any no-unsafe-any - because it is private
        (resource as any).gameName = gameName;
    }

    return frozen as any; // tslint:disable-line:no-any no-unsafe-any
}

/**
 * Creates a object of resources for a given game object.
 *
 * @param gameObject - The GameObject that gets new sprites added to it its container.
 * @param resources - The resources in the game.
 * @returns A new object of factory functions for the resources and game object.
 */
export function createResourcesFor<T extends IBaseRendererResources>(
    gameObject: InstanceType<RenderableGameObjectClass>,
    resources: T,
): ResourcesForGameObject<T> {
    return mapValues(resources, (resource, key) => () => {
        if (!(resource instanceof BaseRendererResource)) {
            throw new Error(`Resource with key ${key} cannot be undefined`);
        }

        return (options: IPixiSpriteOptions) => resource.newSprite({
            container: gameObject.container,
            ...options,
        });
    }) as any; // tslint:disable-line:no-any no-unsafe-any - lodash types are weird to convert
}
