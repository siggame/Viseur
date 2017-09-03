import * as PIXI from "pixi.js";
import { IPixiSpriteOptions, setPixiOptions } from "src/utils";
import { viseur } from "src/viseur";
import { viseurStarted } from "src/viseur/started";

/** non standard options for resources */
export interface IRendererResourcesOptions {
    /** Set this if the path is absolute and does not need to be resolved */
    absolute?: boolean;

    /** A new default width aside from 1 */
    width?: number;

    /** A new default height aside from 1 */
    height?: number;
}

/** A factory that creates PIXI.Sprites for some resource in the Renderer */
export class RendererResource {
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

    /**
     * Creates and registers a new resource that can make sprites of it
     * @param path The path to the resource in the game's textures directory
     * @param options optional details about the resource, such as defaults and sheet details
     */
    constructor(path: string, options: IRendererResourcesOptions = {}) {
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
     * Creates and initializes a sprite for this resource
     * @param {PIXI.Container} parentContainer the parent container for the sprite
     * @param options thi
     * @returns {PIXI.Sprite} a sprite with the given texture key, added to the parentContainer
     */
    public newSprite(parentContainer: PIXI.Container, options?: IPixiSpriteOptions): PIXI.Sprite {
        const sprite = new PIXI.Sprite(this.texture);
        sprite.setParent(parentContainer);

        // now scale the sprite, as it defaults to the dimensions of it's texture's pixel size
        this.resetScale(sprite);

        if (options) {
            setPixiOptions(sprite, options);
        }

        return sprite;
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
     */
    protected onTextureLoaded(resources: PIXI.loaders.ResourceDictionary): void {
        const texture = resources[this.path].texture;
        this.texture = texture;
    }
}
