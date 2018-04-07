// This is a simple function to be used in games
import { BaseRendererResource, IBaseRendererResourceOptions } from "./base-renderer-resource";
import { RendererResource } from "./renderer-resource";
import { ISheetData, RendererSheetResource } from "./renderer-sheet-resource";

export interface IRendererResources {
    [key: string]: BaseRendererResource;
    blank: RendererResource;
}

export interface IResourceLoadOptions extends IBaseRendererResourceOptions {
    /** The sheet data, if present this loads a sprite sheet */
    sheet?: ISheetData;
}

/**
 * Loads a resource for a game given the name of the file and some options
 * @param texture the name of the file to load
 * @param options optional object of options about the texture,
 * @returns a renderer resource which is a PIXI.Sprite factory for that resource
 */
export function load(texture: string, options?: IBaseRendererResourceOptions): RendererResource;

/**
 * Loads a resource for a game given the name of the file and some options
 * @param texture the name of the file to load
 * @param options optional object of options about the texture,
 *                if a sheet is present the sheet version will be returned
 * @returns a renderer resource which is a PIXI.Sprite factory for that resource
 */
export function load(texture: string, options?: IResourceLoadOptions): RendererSheetResource;

/**
 * Loads a resource for a game given the name of the file and some options
 * @param texture the name of the file to load
 * @param options optional object of options about the texture,
 *                if a sheet is present the sheet version will be returned
 * @returns a renderer resource which is a PIXI.Sprite factory for that resource
 */
export function load(texture: string, options?: IResourceLoadOptions,
): RendererResource | RendererSheetResource {
    if (options && options.sheet) {
        const sheet = options.sheet;
        delete options.sheet;
        return new RendererSheetResource(texture, sheet, options);
    }

    return new RendererResource(texture, options);
}

/**
 * Creates an object interface of resources for games
 * @param gameName the name of the game to create resources for
 * @param resources this must be a key/value list, key must be a string, value must be a RendererResource
 * @returns that same object frozen and extended with the index interface for TS
 */
export function createResources<T extends {}>(gameName: string, resources: T): Readonly<T & IRendererResources> {
    const frozen = Object.freeze(Object.assign({
        blank: new RendererResource(require("src/viseur/images/blank.png"), {
            absolute: true,
        }),
    }, resources));

    for (const key of Object.keys(frozen)) {
        const resource: any = (frozen as any)[key];
        resource.gameName = gameName;
    }

    return frozen as any; // TODO: get TS to be happy with blank's key being a string
}
