import { Immutable, IPixiSpriteOptions, setPixiOptions } from "src/utils";
import { BaseRendererResource } from "./base-renderer-resource";

/** A factory that creates PIXI.Sprites for some resource in the Renderer */
export class RendererResource extends BaseRendererResource {
    /**
     * Creates and initializes a sprite for this resource.
     *
     * @param parentContainer - The parent container for the sprite.
     * @param options - The base options for how to render this resource.
     * @returns A sprite with the given texture key, added to the
     * parentContainer.
     */
    public newSprite(
        parentContainer: PIXI.Container,
        options?: Immutable<IPixiSpriteOptions>,
    ): PIXI.Sprite {
        const sprite = new PIXI.Sprite(this.texture);
        sprite.setParent(parentContainer);

        // Now scale the sprite, as it defaults to the dimensions of its
        // texture's pixel size.
        this.resetScale(sprite);

        if (options) {
            setPixiOptions(sprite, options);
        }

        return sprite;
    }
}
