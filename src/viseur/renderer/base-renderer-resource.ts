import * as PIXI from "pixi.js";
import { viseur } from "src/viseur";
import { viseurStarted } from "src/viseur/started";

/** non standard options for resources */
export interface IBaseRendererResourceOptions {
    /** Set this if the path is absolute and does not need to be resolved */
    absolute?: boolean;

    /** A new default width aside from 1 */
    width?: number;

    /** A new default height aside from 1 */
    height?: number;
}

/** A factory that creates PIXI.Sprites for some resource in the Renderer */
export abstract class BaseRendererResource {
    /** The path to the resource in the game's textures directory */
    public readonly path: string;

    /** the required absolute path to this resource */
    public absolutePath: string;

    /** The default width (in game units) for new sprites from this resource */
    public readonly defaultWidth: number = 1;

    /** The default height (in game units) for new sprites from this resource */
    public readonly defaultHeight: number = 1;

    /** The texture for this sprite */
    protected texture: PIXI.Texture;

    /** the name of the game this resource is for */
    private readonly gameName: string = ""; // will be set from the load function

    /**
     * Creates and registers a new resource that can make sprites of it
     * @param path The path to the resource in the game's textures directory
     * @param options optional details about the resource, such as defaults and sheet details
     */
    constructor(path: string, options: IBaseRendererResourceOptions = {}) {
        this.path = path;
        this.defaultWidth = Math.max(1, options.width || 0);
        this.defaultHeight = Math.max(1, options.height || 0);
        this.absolutePath = options.absolute
            ? this.path
            : "";

        viseurStarted.on(() => {
            viseur.renderer.events.texturesLoaded.on((resources) => this.onTextureLoaded(resources));
        });
    }

    /**
     * Un-scales a sprite back to its' default dimensions of this resource
     * @param {PIXI.Sprite} sprite the sprite to un-scale back to 1x1
     */
    public resetScale(sprite: PIXI.Sprite): void {
        sprite.scale.set(
            this.defaultWidth / sprite.texture.width,
            this.defaultHeight / sprite.texture.height,
        );
    }

    /**
     * Invoked when this texture is loaded
     * @param resources all the resources loaded, to pull our texture out of
     * @returns a boolean indicating if this resource's texture was loaded
     */
    protected onTextureLoaded(resources: PIXI.loaders.ResourceDictionary): boolean {
        if (viseur.game.name !== this.gameName) {
            // this resource is for a different game, and will never be used
            // so we don't care if it loaded or not
            return false;
        }

        const resource = resources[this.path];
        if (!resource) {
            throw new Error(`Could not find loaded resource for ${this.path}`);
        }

        const texture = resource.texture;
        this.texture = texture;

        return true;
    }
}
