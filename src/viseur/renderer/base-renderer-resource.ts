import * as PIXI from "pixi.js";
import {
    Immutable,
    PixiSpriteOptions,
    setPixiOptions,
    TypedObject,
} from "src/utils";
import { Viseur } from "src/viseur";
import { eventViseurConstructed } from "src/viseur/constructed";

/** Non standard options for resources. */
export interface BaseRendererResourceOptions {
    /** Set this if the path is absolute and does not need to be resolved. */
    absolute?: boolean;

    /** A new default width aside from 1. */
    width?: number;

    /** A new default height aside from 1. */
    height?: number;
}

/** A factory that creates PIXI.Sprites for some resource in the Renderer. */
export abstract class BaseRendererResource {
    /** The path to the resource in the game's textures directory. */
    public readonly path: string;

    /** The required absolute path to this resource. */
    public absolutePath: string;

    /** The default width (in game units) for new sprites from this resource. */
    public readonly defaultWidth: number = 1;

    /** The default height (in game units) for new sprites from this resource. */
    public readonly defaultHeight: number = 1;

    /** The texture for this sprite, undefined while not loaded. */
    protected texture: PIXI.Texture | undefined;

    /** The name of the game this resource is for. */
    private readonly gameName: string = ""; // will be set from the load()

    /** The Viseur that controls everything. */
    private viseur: Viseur | undefined;

    /**
     * Creates and registers a new resource that can make sprites of it.
     *
     * @param path - The path to the resource in the game's textures directory.
     * @param options - The optional details about the resource, such as defaults and sheet details.
     */
    constructor(path: string, options: BaseRendererResourceOptions = {}) {
        this.path = path;
        this.defaultWidth = Math.max(1, options.width || 0);
        this.defaultHeight = Math.max(1, options.height || 0);
        this.absolutePath = options.absolute ? this.path : "";

        eventViseurConstructed.once((viseur) => {
            this.viseur = viseur;
            viseur.renderer.eventTexturesLoaded.on((resources) => {
                this.onTextureLoaded(resources);
            });
        });
    }

    /**
     * Un-scales a sprite back to its default dimensions of this resource.
     *
     * @param sprite - The sprite to un-scale back to 1x1.
     */
    public resetScale(sprite: PIXI.Sprite): void {
        sprite.scale.set(
            this.defaultWidth / sprite.texture.width,
            this.defaultHeight / sprite.texture.height,
        );
    }

    /**
     * Creates and initializes a sprite for this resource.
     *
     * @param options - The base options for how to render this resource.
     * @returns A sprite with the given texture key, added to the
     * parentContainer.
     */
    public newSprite(options: Immutable<PixiSpriteOptions>): PIXI.Sprite {
        const sprite = new PIXI.Sprite(this.texture);

        // Now scale the sprite, as it defaults to the dimensions of its texture's pixel size.
        this.resetScale(sprite);
        setPixiOptions(sprite, options);

        return sprite;
    }

    /**
     * Invoked when this texture is loaded.
     *
     * @param resources - All the resources loaded, to pull our texture out of.
     * @returns A boolean indicating if this resource's texture was loaded.
     */
    protected onTextureLoaded(
        resources: TypedObject<PIXI.LoaderResource>,
    ): boolean {
        // if we have textures loaded, Viseur must have a game ready
        if (
            !this.viseur ||
            !this.viseur.game ||
            this.viseur.game.name !== this.gameName
        ) {
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
