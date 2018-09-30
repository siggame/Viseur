// This is a simple function to be used in games
import { BaseRendererResource, IBaseRendererResourceOptions } from "./base-renderer-resource";
import { RendererResource } from "./renderer-resource";
import { ISheetData, RendererSheetResource } from "./renderer-sheet-resource";

/** The base resources all games can expect. */
export interface IRendererResources {
    [key: string]: BaseRendererResource | undefined;
    blank: RendererResource;
}

/** The options for a resource to be loaded for the Renderer. */
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
 * Loads a resource for a game given the name of the file and sheet options.
 * @param texture the name of the file to load
 * @param options optional object of options about the texture,
 *                if a sheet is present the sheet version will be returned
 * @returns a renderer resource which is a PIXI.Sprite factory for that resource
 */
export function load(texture: string, options: IResourceLoadOptions): RendererSheetResource;

/**
 * Loads a resource for a game given the name of the file and some options
 * @param texture the name of the file to load
 * @param options optional object of options about the texture,
 *                if a sheet is present the sheet version will be returned
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
 * Creates an object interface of resources for games
 * @param gameName the name of the game to create resources for
 * @param resources this must be a key/value list, key must be a string, value must be a RendererResource
 * @returns that same object frozen and extended with the index interface for TS
 */
export function createResources<
    T extends { [key: string]: BaseRendererResource | undefined }
>(
    gameName: string,
    resources: T,
): Readonly<T & IRendererResources> {
    const frozen = Object.freeze({
        blank: new RendererResource(
            // tslint:disable-next-line:no-require-imports no-unsafe-any
            require("src/viseur/images/blank.png"),
            { absolute: true },
        ),
        ...(resources as { [key: string]: BaseRendererResource }),
    });

    for (const resource of Object.values(frozen)) {
        // tslint:disable-next-line:no-any no-unsafe-any - because it is private
        (resource as any).gameName = gameName;
    }

    return frozen as any; // tslint:disable-line:no-any no-unsafe-any
}
