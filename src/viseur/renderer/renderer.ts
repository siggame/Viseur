import * as $ from "jquery";
import * as PIXI from "pixi.js";
import { Event } from "src/core/event";
import { BaseElement, IBaseElementArgs } from "src/core/ui/base-element";
import { ContextMenu, MenuItems } from "src/core/ui/context-menu";
import { clamp, euclideanDistance, IPoint, setRelativePivot } from "src/utils";
import { viseur } from "src/viseur";
import { IRendererResourcesOptions, RendererResource } from "./renderer-resource";
import { ISheetData, RendererSheetResource } from "./renderer-sheet-resource";
import "./renderer.scss";

/** A singleton that handles rendering (visualizing) the game */
export class Renderer extends BaseElement {
    /** The in game width, e.g. for chess this would be 8 */
    public width: number = 1;

    /** The in game height, e.g. for chess this would be 8 */
    public height: number = 1;

    /** top offset for rendering */
    public topOffset: number = 0;

    /** right offset for rendering */
    public rightOffset: number = 0;

    /** bottom offset for rendering */
    public bottomOffset: number = 0;

    /** left offset for rendering */
    public leftOffset: number = 0;

    /** The root of all PIXI game objects in the game */
    public readonly gameContainer = new PIXI.Container();

    /** All the events this emits */
    public readonly events = Object.freeze({
        /** Emitted once the textures are loaded for the game */
        texturesLoaded: new Event<PIXI.loaders.ResourceDictionary>(),

        /** Triggered when a specific id key is changed */
        rendering: new Event<undefined>(),
    });

    /** The scene (root) of all PIXI objects we will render */
    private readonly scene = new PIXI.Container();

    /** PIXI Graphics object used to draw GUI interactions on the game */
    private readonly gameGraphics = new PIXI.Graphics();

    /** The root of all per pixel objects (GUI) */
    private readonly pxContainer = new PIXI.Container();

    /** PIXI Graphics drawn per pixel (GUI) */
    private readonly pxGraphics = new PIXI.Graphics();

    /** The default font family to use when creating PIXI text(s) */
    private readonly defaultFontFamily: string;

    /** The rendered external width */
    private pxExternalWidth: number = 800;

    /** The rendered external width */
    private pxExternalHeight: number = 600;

    /** scaled x value to get from px to game units */
    private scaledX: number = 1;

    /** scaled y value to get from px to game units */
    private scaledY: number = 1;

    /** The unscaled external width */
    private pxWidth: number = 800;

    /** The unscaled external width */
    private pxHeight: number = 600;

    /** PIXI renderer (what this is kind of a wrapper around) */
    private readonly pixiApp: PIXI.Application;

    /** The actual canvas element pixi uses for rendering */
    private readonly pixiCanvas: JQuery<HTMLElement>;

    /** Our custom context menu */
    private readonly contextMenu: ContextMenu;

    /** loaded texture data */
    private readonly resources: RendererResource[] = [];

    /**
     * Initializes the Renderer, should be called by Viseur
     * @param {Object} args initialization args
     */
    constructor(args: IBaseElementArgs & {
        /** The default font family to use and override the styled default */
        defaultFontFamily?: string,
    }) {
        super(args);

        this.scene.addChild(this.gameContainer);
        this.gameContainer.addChild(this.gameGraphics);

        this.scene.addChild(this.pxContainer);
        this.pxContainer.addChild(this.pxGraphics);

        // try to default the font to that of the default css rule
        this.defaultFontFamily = args.defaultFontFamily
            || $("body").css("font-family").split(",")[0]
            || "Sans-Serif";

        // check only now for anti-aliasing, because them changing it requires a restart to see it inverted
        const aa: boolean = viseur.settings.antiAliasing.get(true);

                                            // will be resized, just placeholder dimensions
        this.pixiApp = new PIXI.Application(this.pxExternalWidth, this.pxExternalHeight, {
            antialias: aa,
            forceFXAA: aa,
        });

        this.setSize(1, 1);

        // add the renderer view element to the DOM
        this.element
            .append(this.pixiApp.renderer.view)
            .on("resize", () => {
                this.resize(this.element.width(), this.element.height());
            })
            .on("contextmenu", () => {
                // we'll show our on context menu, so disable the browser's default one
                return false;
            });

        this.pixiCanvas = this.element.find("canvas");

        // when resolution settings change, resize
        viseur.settings.resolutionScale.changed.on(() => {
            this.resize();
        });

        viseur.settings.showGrid.changed.on(() => {
            this.drawGrid();
        });

        this.contextMenu = new ContextMenu({
            id: "viseur-context-menu",
            parent: this.element,
        });

        this.pixiApp.ticker.stop();
        this.pixiApp.ticker.add(() => {
            this.render();
        });
        this.pixiApp.ticker.start();
    }

    /**
     * Loads a resource for a game given the name of the file and some options
     * @param texture the name of the file to load
     * @param options optional object of options about the texture
     * @returns a renderer resource which is a PIXI.Sprite factory for that resource
     */
    public load(texture: string, options?: IRendererResourcesOptions): RendererResource {
        const resource = new RendererResource(texture, options);
        this.resources.push(resource);
        return resource;
    }

    /**
     * Loads a resource for a game given the name of the file and some options
     * @param texture the name of the file to load
     * @param options the object of options about the texture
     * @param sheet the details about this sheet
     * @returns a renderer resource which is a PIXI.Sprite factory for that resource
     */
    public loadSheet(texture: string, options: IRendererResourcesOptions, sheet: ISheetData): RendererSheetResource {
        const resource = new RendererSheetResource(texture, sheet, options);
        this.resources.push(resource);
        return resource;
    }

    /**
     * loads textures into PIXI
     * @param {function} callback an optional callback function to invoke once all functions are loaded
     */
    public loadTextures(callback?: () => void): void {
        const loader = PIXI.loader;

        for (const resource of this.resources) {

            if (!resource.absolutePath) {
                resource.absolutePath = `src/games/${viseur.game.name.toLowerCase()}/textures/${resource.path}`;
            }

            loader.add(resource.path, resource.absolutePath);
        }

        loader.load((sameLoader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
            this.events.texturesLoaded.emit(resources);

            if (callback) {
                callback();
            }
        });
    }

    /**
     * Sets the size of the Renderer, not in pixels but some abstract size.
     * Basically the size of the map. So for example in chess it would be 8x8,
     * and the actual size in pixels will be calculated by the Renderer, regardless of screen size
     * @param {number} width the width of the renderer
     * @param {number} height the height of the renderer
     * @param {number} [topOffset=0] the top y offset for the grid
     * @param {number} [leftOffset=0] the left x offset for the grid
     * @param {number} [bottomOffset=0] the bottom y offset for the grid
     * @param {number} [rightOffset=0] the right x offset for the grid
     */
    public setSize(
        width: number,
        height: number,
        // offsets are in case you want game dimensions with a border around it while preserving correct numbers
        topOffset: number = 0,
        leftOffset: number = 0,
        bottomOffset: number = 0,
        rightOffset: number = 0,
    ): void {
        this.width = Math.abs(width || 1);
        this.height = Math.abs(height || 1);

        this.topOffset = topOffset;
        this.leftOffset = leftOffset;
        this.bottomOffset = bottomOffset;
        this.rightOffset = rightOffset;

        this.resize();
    }

    /**
     * Creates a new Pixi.Text object in the Renderer.
     * This will use DPI scaling based on screen resolution for crisp text
     * @param {string} text the text to initialize in the PIXI.Text
     * @param {PIXI.Container} parent the the parent container for the new text
     * @param {Object} [options] the options to send to the PIXI.Text initialization
     * @param {number} [height=1] the desired height of the text, relative to the game's units (not px)
     * @returns {PIXI.Text} the newly created text
     */
    public newPixiText(
        text: string,
        parent: PIXI.Container,
        options?: PIXI.TextStyleOptions,
        height: number = 1,
    ): PIXI.Text {
        options = Object.assign({
            fontFamily: this.defaultFontFamily,
        }, options) || {};

        const pxSize = (height * (screen.height / this.height));
        options.fontSize = pxSize + "px"; // the max height in pixels that this text should be drawn at

        const pixiText = new PIXI.Text(text, options);

        pixiText.setParent(parent);
        pixiText.scale.set(height / pxSize);

        return pixiText;
    }

    /**
     * Shows a menu structure as a context menu at the given (x, y)
     * @param {Object} menus the ContextMenu structure to show
     * @param {number} x the x position in pixels relative to top left of canvas
     * @param {number} y the y position in pixels relative to top left of canvas
     */
    public showContextMenu(menus: MenuItems, x: number, y: number): void {
        this.contextMenu.setStructure(menus);
        this.contextMenu.show(x, y);
    }

    /**
     * Takes a sprite a "stretches" it between two points along it's width, useful for beam type effects
     * @param {PIXI.Sprite} sprite the sprite to use. Assumed to be 1x1 units by default.
     *                             It's width and pivot will be scaled for the stretching
     * @param {IPoint} pointA the first point, an object with an {x, y} to derive coordinates from
     * @param {IPoint} pointB the second point, an object with an {x, y} to derive coordinates from
     */
    public renderSpriteBetween(sprite: PIXI.Sprite, pointA: IPoint, pointB: IPoint): void {
        const distance = euclideanDistance(pointA, pointB);
        sprite.width = distance;
        setRelativePivot(sprite, 0.5, 0.5);

        const angleRadians = Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x);
        sprite.rotation = angleRadians;

        const midX = (pointA.x + pointB.x) / 2;
        const midY = (pointA.y + pointB.y) / 2;
        sprite.position.set(midX + 0.5, midY + 0.5);
    }

    /**
     * Resizes the render to fit its container, or resize to fit a new size
     * @param {number} [pxExternalWidth] the max width in px the renderer can fill,
     *                                   defaults to the last stored mxMaxWidth
     * @param {number} [pxExternalHeight] the max height in px the renderer can fill,
     *                                    defaults to the last stored mxMaxHeight
     */
    public resize(pxExternalWidth?: number, pxExternalHeight?: number): void {
        if (pxExternalWidth === undefined && pxExternalHeight === undefined) {
            // then get the saved resolution
            pxExternalWidth = this.pxExternalWidth;
            pxExternalHeight = this.pxExternalHeight;
        }
        else {
            // save this resolution
            pxExternalWidth = pxExternalWidth || 800;
            pxExternalHeight = pxExternalHeight || 600;

            this.pxExternalWidth = pxExternalWidth;
            this.pxExternalHeight = pxExternalHeight;
        }

        const resolutionScale = viseur.settings.resolutionScale.get();

        // Clamp between 1 to 4096 pixels, with 4096 being the smallest max a
        // that browser can do without screwing up our scaling math
        // Note: (yes 1px x 1px would be stupid to render)
        const pxInternalWidth = clamp(pxExternalWidth * resolutionScale, 1, 4096);
        const pxInternalHeight = clamp(pxExternalHeight * resolutionScale, 1, 4096);

        let scaleRatio = this.getScaleRatio(pxInternalWidth, pxInternalHeight);

        let pxWidth = this.width * scaleRatio;
        let pxHeight = this.height * scaleRatio;

        this.scaledX = pxWidth / this.width;
        this.scaledY = pxHeight / this.height;

        this.gameContainer.scale.set(this.scaledX, this.scaledY);

        if (pxWidth !== this.pxWidth || pxHeight !== this.pxHeight) {
            this.pixiApp.renderer.resize(pxWidth, pxHeight);
        }

        this.pxWidth = pxWidth;
        this.pxHeight = pxHeight;

        if (this.pixiCanvas) {
            if (pxExternalWidth !== pxInternalWidth && pxExternalHeight !== pxInternalHeight) {
                // have css scale it
                scaleRatio = this.getScaleRatio(pxExternalWidth, pxExternalHeight);
                pxWidth = this.width * scaleRatio;
                pxHeight = this.height * scaleRatio;

                const cssWidth = this.pixiCanvas.attr("width") as string;
                const ratio = Number(cssWidth.replace("px", "")) / this.pxWidth;
                this.pixiCanvas.css("width", (pxWidth * ratio) + "px");
            }
            else {
                // pixel perfect fit
                this.pixiCanvas.removeAttr("style");
            }
        }

        // now position the rendered to center it horizontally and vertically
        this.element
            .css("left", (pxExternalWidth / 2) - (pxWidth / 2))
            .css("top", (pxExternalHeight / 2) - (pxHeight / 2));

        this.drawGrid();
    }

    protected getTemplate(): Handlebars {
        return require("./renderer.hbs");
    }

    /**
     * Gets the scale ratio based on available width/height to draw in
     * @param {number} width available pixels along x
     * @param {number} height available pixels along y
     * @returns {number} a number to scale the width and height both by to fill them according to our aspect ratio
     */
    private getScaleRatio(width: number, height: number): number {
        // source: https://www.snip2code.com/Snippet/83438/A-base-implementation-of-properly-handli

        // scale to fix via width
        const pxFatness = width / height;
        const ourFatness = this.width / this.height;

        // adjust scaling
        let scaleRatio = 1;
        if (ourFatness >= pxFatness) {
            // scale for a snug width
            scaleRatio = width / this.width;
        }
        else {
            // scale for a snug height
            scaleRatio = height / this.height;
        }

        return scaleRatio;
    }

    /**
     * Draws a grid over the scene if the setting is enabled
     */
    private drawGrid(): void {
        this.pxGraphics.clear();

        if (!viseur.settings.showGrid.get()) {
            // don't want to show the grid, let's bug out!
            return;
        }

        this.pxGraphics.lineStyle(1, 0x000000, 0.5);

        const startX = this.leftOffset * this.scaledX;
        const startY = this.topOffset * this.scaledY;
        const endX = (this.width - this.rightOffset) * this.scaledX;
        const endY = (this.height - this.bottomOffset) * this.scaledY;

        // draw vertical lines
        for (let x = 0; x < this.width; x++) {
            const dx = x * this.scaledX + startX;
            this.pxGraphics.moveTo(dx, startY);
            this.pxGraphics.lineTo(dx, endY);
            this.pxGraphics.endFill();
        }

        // draw horizontal lines
        for (let y = 0; y < this.height; y++) {
            const dy = y * this.scaledY + startY;
            this.pxGraphics.moveTo(startX, dy);
            this.pxGraphics.lineTo(endX, dy);
            this.pxGraphics.endFill();
        }
    }

    /**
     * Force renders everything
     */
    private render(): void {
        // tell everything that is observing us that they need to update their PIXI objects
        this.events.rendering.emit(undefined);
        // and now have PIXI render it
        this.pixiApp.renderer.render(this.scene);
    }
}
