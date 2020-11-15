import * as PIXI from "pixi.js";
import { FirstArgument, Point, printPoint, setPixiOptions } from "src/utils";
import {
    BaseRendererResource,
    BaseRendererResourceOptions,
} from "./base-renderer-resource";

/** Optional details about the sprite sheet. */
export interface SheetData {
    /** Major axis to start numbering from. */
    axis: "x" | "y";

    /** The width of the sheet. */
    width: number;

    /** The height of the sheet. */
    height: number;
}

/** A resource that is a sprite sheet. */
export class RendererSheetResource extends BaseRendererResource {
    /** If present this resource is a sprite sheet. */
    private readonly sheet: SheetData;

    /**
     * The mapped textures for each image in the sheet,
     * if this resource is a sheet.
     */
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
        sheet: SheetData,
        options?: BaseRendererResourceOptions,
    ) {
        super(path, options);
        this.sheet = sheet;
    }

    /**
     * Creates and initializes a sprite for this resource.
     *
     * @param options - The optional options to set at init.
     * @returns A sprite with the given texture key, added to the
     * parentContainer.
     */
    public newSprite(
        options: FirstArgument<BaseRendererResource["newSprite"]> &
            Readonly<{
                /** The index in the sheet to create the the sprite from. */
                index: number;
            }>,
    ): PIXI.Sprite {
        const sprite = new PIXI.Sprite(this.getTexture(options.index));

        // Now scale the sprite, as it defaults to the dimensions of its
        // texture's pixel size.
        this.resetScale(sprite);
        setPixiOptions(sprite, options);

        return sprite;
    }

    /**
     * Gets the texture for a given point {x, y} in the sheet.
     *
     * @param point - The {x, y} point to get within textures.
     * @returns A PIXI.Texture for that given point.
     */
    public getTexture(point: Point): PIXI.Texture;

    /**
     * Gets the texture for two numbers (x, y) in the sheet.
     *
     * @param x - The x position of the point to get within textures.
     * @param y - The y position of the point to get within textures.
     * @returns A PIXI.Texture for that given (x, y).
     */
    public getTexture(x: number, y: number): PIXI.Texture;

    /**
     * Gets the texture for a given index in the sheet.
     *
     * @param index - The index number within textures.
     * @returns A PIXI.Texture for that given index.
     */
    public getTexture(index: number): PIXI.Texture;

    /**
     * Gets the texture at an index, point, or (x, y) permutations.
     *
     * @param first - A point or number for the index/co-ordinate.
     * @param second - If an x, y tuple, this is the y value. Should be
     * undefined otherwise.
     * @returns A PIXI.Texture for that given index.
     */
    public getTexture(first: number | Point, second?: number): PIXI.Texture {
        let index = -Infinity;
        let point: Point | undefined;
        if (typeof first === "number") {
            if (typeof second === "number") {
                point = { x: first, y: second };
            } else {
                index = first;
            }
        } else {
            point = first;
        }

        if (point) {
            index = point.y * this.sheet.width + point.x;
        }

        if (index < 0 || index >= this.sheetTextures.length) {
            throw new RangeError(
                `'${
                    point
                        ? `Point ${printPoint(point)} -> ${index}`
                        : `Index '${index}'`
                }' is out or range for the RenderSheetResource '${this.path}'`,
            );
        }

        return this.sheetTextures[index];
    }

    /**
     * Invoked when this texture is loaded.
     *
     * @param resources - All the resources loaded, to pull our texture out of.
     * @returns True if it loaded, false otherwise.
     */
    protected onTextureLoaded(resources: PIXI.IResourceDictionary): boolean {
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

        // assume x first for the major axis, but they can manually override
        // with the axis: "y" sheet setting
        const yFirst = sheet.axis === "y";
        const size = sheet.width * sheet.height;

        // build a separate texture for each part of the sprite sheet
        for (let i = 0; i < size; i++) {
            let x = 0;
            let y = 0;

            if (yFirst) {
                x = Math.floor(i / sheet.height);
                y = i % sheet.height;
            } else {
                x = i % sheet.width;
                y = Math.floor(i / sheet.width);
            }

            this.sheetTextures.push(
                new PIXI.Texture(
                    this.texture.baseTexture,
                    new PIXI.Rectangle(x * width, y * height, width, height),
                ),
            );
        }

        return true;
    }
}
