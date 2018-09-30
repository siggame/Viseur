import * as PIXI from "pixi.js";
import { IPixiSpriteOptions, setPixiOptions } from "src/utils";
import { BaseRendererResource, IBaseRendererResourceOptions } from "./base-renderer-resource";

/** optional details about the sprite sheet */
export interface ISheetData {
    /** Major axis to start numbering from */
    axis: "x" | "y";

    /** The width of the sheet */
    width: number;

    /** The height of the sheet */
    height: number;
}

/** A resource that is a sprite sheet */
export class RendererSheetResource extends BaseRendererResource {
    /** If present this resource is a sprite sheet */
    private readonly sheet: ISheetData;

    /** The mapped textures for each image in the sheet, if this resource is a sheet */
    private readonly sheetTextures: PIXI.Texture[] = [];

    /**
     * Creates a sprite sheet for the renderer given options.
     *
     * @param path - The path to the resource.
     * @param sheet - The data about the sprite sheet.
     * @param options - Options about how to render sprites in the sheet.
     */
    constructor(
        path: string,
        sheet: ISheetData,
        options?: IBaseRendererResourceOptions,
    ) {
        super(path, options);
        this.sheet = sheet;
    }

    /**
     * Creates and initializes a sprite for this resource.
     *
     * @param parentContainer - The parent container for the sprite.
     * @param index - The index of the sheet.
     * @param options - The optional options to set at init.
     * @returns A sprite with the given texture key, added to the
     * parentContainer.
     */
    public newSprite(
        parentContainer: PIXI.Container,
        index: number,
        options?: IPixiSpriteOptions,
    ): PIXI.Sprite {
        const sprite = new PIXI.Sprite(this.sheetTextures[index]);
        sprite.setParent(parentContainer);

        // Now scale the sprite, as it defaults to the dimensions of its
        // texture's pixel size.
        this.resetScale(sprite);

        if (options) {
            setPixiOptions(sprite, options);
        }

        return sprite;
    }

    /**
     * Invoked when this texture is loaded
     * @param resources all the resources loaded, to pull our texture out of
     * @returns true if it loaded, false otherwise
     */
    protected onTextureLoaded(resources: PIXI.loaders.ResourceDictionary): boolean {
        const loaded = super.onTextureLoaded(resources);

        if (!loaded) {
            return false;
        }

        const sheet = this.sheet;
        if (!sheet) {
            throw new Error(`Resource ${this.path} lost its sheet somehow`);
        }

        if (!this.texture) {
            throw new Error(`Resource ${this.path} not actually loaded`);
        }

        // texture is now set as it's loaded
        const width = this.texture.width / sheet.width;
        const height = this.texture.height / sheet.height;

        // assume x first for the major axis, but they can manually override with the axis: "y" sheet setting
        const yFirst = (sheet.axis === "y");
        const size = sheet.width * sheet.height;

        // build a separate texture for each part of the sprite sheet
        for (let i = 0; i < size; i++) {
            let x = 0;
            let y = 0;

            if (yFirst) {
                x = Math.floor(i / sheet.height);
                y = i % sheet.height;
            }
            else {
                x = i % sheet.width;
                y = Math.floor(i / sheet.width);
            }

            this.sheetTextures.push(new PIXI.Texture(
                this.texture.baseTexture,
                new PIXI.Rectangle(x * width, y * height, width, height),
            ));
        }

        return true;
    }
}
