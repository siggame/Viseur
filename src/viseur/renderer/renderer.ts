import * as $ from "jquery";
import { clamp } from "lodash";
import * as PIXI from "pixi.js";
import { BaseElement, BaseElementArgs } from "src/core/ui/base-element";
import { ContextMenu, MenuItems } from "src/core/ui/context-menu";
import { isImportedResource, TypedObject } from "src/utils";
import { Viseur } from "src/viseur";
import { createEventEmitter } from "ts-typed-events";
import * as rendererHbs from "./renderer.hbs";
import "./renderer.scss";

/** The arguments used to initialize the renderer's width/height size. */
export interface RendererSize {
    /** The width of the renderer. */
    width: number;

    /** The height of the renderer. */
    height: number;

    /** The top y offset for the grid. */
    topOffset?: number;

    /** The left x offset for the grid. */
    leftOffset?: number;

    /** The bottom y offset for the grid. */
    bottomOffset?: number;

    /** The right x offset for the grid. */
    rightOffset?: number;
}

/** A singleton that handles rendering (visualizing) the game. */
export class Renderer extends BaseElement {
    /** The in game width, e.g. For chess this would be 8. */
    public width = 1;

    /** The in game height, e.g. For chess this would be 8. */
    public height = 1;

    /** Top offset for rendering. */
    public topOffset = 0;

    /** Right offset for rendering. */
    public rightOffset = 0;

    /** Bottom offset for rendering. */
    public bottomOffset = 0;

    /** Left offset for rendering. */
    public leftOffset = 0;

    /** The root of all PIXI game objects in the game. */
    public readonly gameContainer = new PIXI.Container();

    /** Emitter for textures loaded event. */
    private readonly emitTexturesLoaded = createEventEmitter<
        TypedObject<PIXI.LoaderResource>
    >();

    /** Emitted once the textures are loaded for the game. */
    public readonly eventTexturesLoaded = this.emitTexturesLoaded.event;

    /** Emitter for inspect event. */
    private readonly emitRendering = createEventEmitter();

    /** Emitted when a specific id key is changed. */
    public readonly eventRendering = this.emitRendering.event;

    /** The scene (root) of all PIXI objects we will render. */
    private readonly scene = new PIXI.Container();

    /** PIXI Graphics object used to draw GUI interactions on the game. */
    private readonly gameGraphics = new PIXI.Graphics();

    /** The root of all per pixel objects (GUI). */
    private readonly pxContainer = new PIXI.Container();

    /** PIXI Graphics drawn per pixel (GUI). */
    private readonly pxGraphics = new PIXI.Graphics();

    /** The default font family to use when creating PIXI text(s). */
    private readonly defaultFontFamily: string;

    /** The rendered external width. */
    private pxExternalWidth = 800;

    /** The rendered external width. */
    private pxExternalHeight = 600;

    /** Scaled x value to get from px to game units. */
    private scaledX = 1;

    /** Scaled y value to get from px to game units. */
    private scaledY = 1;

    /** The unscaled external width. */
    private pxWidth = 800;

    /** The unscaled external width. */
    private pxHeight = 600;

    /** PIXI renderer (what this is kind of a wrapper around). */
    private readonly pixiApp: PIXI.Application;

    /** The actual canvas element pixi uses for rendering. */
    private readonly pixiCanvas: JQuery;

    /** Our custom context menu. */
    private readonly contextMenu: ContextMenu;

    /** Our reference to the parent viseur. */
    private readonly viseur: Viseur;

    /**
     * Initializes the Renderer, should be called by Viseur.
     *
     * @param args - Initialization args.
     */
    constructor(
        args: BaseElementArgs & {
            /**
             * The default font family to use and override the styled default.
             */
            defaultFontFamily?: string;

            /** The Viseur instance we are a part of. */
            viseur: Viseur;
        },
    ) {
        super(args, rendererHbs);

        this.viseur = args.viseur;
        this.scene.addChild(this.gameContainer);
        this.gameContainer.addChild(this.gameGraphics);

        this.scene.addChild(this.pxContainer);
        this.pxContainer.addChild(this.pxGraphics);

        // try to default the font to that of the default css rule
        this.defaultFontFamily =
            args.defaultFontFamily ||
            $("body").css("font-family").split(",")[0] ||
            "Sans-Serif";

        this.pixiApp = new PIXI.Application({
            // will be resized, just placeholder dimensions
            width: this.pxExternalWidth,
            height: this.pxExternalWidth,
            // check only now for anti-aliasing, because them changing it requires
            // a restart to see it inverted
            antialias: this.viseur.settings.antiAliasing.get(),
        });

        this.setSize({ width: 10, height: 10 });

        // add the renderer view element to the DOM
        this.element
            .append(this.pixiApp.view)
            .on("resize", () => {
                this.resize(this.element.width(), this.element.height());
            })
            .on("contextmenu", () => {
                // we'll show our on context menu, so disable the browser's default one
                return false;
            });

        this.pixiCanvas = this.element.find("canvas");

        // when resolution settings change, resize
        this.viseur.settings.resolutionScale.changed.on(() => {
            this.resize();
        });

        this.viseur.settings.showGrid.changed.on(() => {
            this.drawGrid();
        });

        this.contextMenu = new ContextMenu({
            id: "viseur-context-menu",
            parent: this.element,
        });

        this.pixiApp.stage.addChild(this.scene);
        const graphics = new PIXI.Graphics();
        graphics.lineStyle(2, 0x0000ff, 1);
        graphics.beginFill(0xff700b, 1);
        graphics.drawRect(0, 0, 200, 200);

        this.pixiApp.ticker.stop();
        this.pixiApp.ticker.add(() => {
            this.render();
        });
        this.pixiApp.ticker.start();
    }

    /**
     * Loads textures into PIXI.
     *
     * @param callback - An optional callback function to invoke once all
     * functions are loaded.
     */
    public loadTextures(callback?: () => void): void {
        const loader = PIXI.Loader.shared;

        if (!this.viseur.game) {
            throw new Error("Cannot load textures for undefined game");
        }

        // add the game's resources to our own
        for (const [key, resource] of Object.entries(
            this.viseur.game.resources,
        )) {
            if (!resource) {
                throw new Error(`undefined key set for ${key}`);
            }

            if (!resource.absolutePath) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
                const required: unknown = require(`src/games/${this.viseur.game.name.toLowerCase()}/resources/${
                    resource.path
                }`);
                if (!isImportedResource(required)) {
                    throw new Error(
                        `Cannot dynamically load path '${resource.path}'.`,
                    );
                }
                resource.absolutePath = required.default;
            }

            loader.add(resource.path, resource.absolutePath);
        }

        loader.load((_sameLoader, resources) => {
            this.emitTexturesLoaded(resources);

            if (callback) {
                callback();
            }
        });
    }

    /**
     * Sets the size of the Renderer, not in pixels but some abstract size.
     * Basically the size of the map. So for example in chess it would be 8x8,
     * and the actual size in pixels will be calculated by the Renderer, regardless of screen size.
     *
     * @param size - The size, must contain a with and height, and can have optional offsets.
     */
    public setSize(size: RendererSize): void {
        this.width = Math.abs(size.width);
        this.height = Math.abs(size.height);

        this.topOffset = size.topOffset || 0;
        this.leftOffset = size.leftOffset || 0;
        this.bottomOffset = size.bottomOffset || 0;
        this.rightOffset = size.rightOffset || 0;

        this.resize();
    }

    /**
     * Creates a new Pixi.Text object in the Renderer.
     * This will use DPI scaling based on screen resolution for crisp text.
     *
     * @param text - The text to initialize in the PIXI.Text.
     * @param parent - The the parent container for the new text.
     * @param [options] - The options to send to the PIXI.Text initialization.
     * @param [height=1] - The desired height of the text, relative to the
     * game's units (not px).
     * @returns The newly created PIXI.Text.
     */
    public newPixiText(
        text: string,
        parent: PIXI.Container,
        options?: Readonly<Partial<PIXI.TextStyle>>,
        height = 1,
    ): PIXI.Text {
        const opts: Partial<PIXI.TextStyle> = {
            fontFamily: this.defaultFontFamily,
            ...options,
        };

        const pxSize = height * (screen.height / this.height);
        // The max height in pixels that this text should be drawn at
        opts.fontSize = `${pxSize}px`;

        const pixiText = new PIXI.Text(text, options);

        pixiText.setParent(parent);
        pixiText.scale.set(height / pxSize);

        return pixiText;
    }

    /**
     * Shows a menu structure as a context menu at the given (x, y).
     *
     * @param menus - The ContextMenu structure to show.
     * @param x - The x position in pixels relative to top left of canvas.
     * @param y - The y position in pixels relative to top left of canvas.
     */
    public showContextMenu(menus: MenuItems, x: number, y: number): void {
        this.contextMenu.setStructure(menus);
        this.contextMenu.show(x, y);
    }

    /**
     * Resizes the render to fit its container, or resize to fit a new size.
     *
     * @param [width] - The max width in px the renderer can fill,
     * defaults to the last stored mxMaxWidth.
     * @param [height] - The max height in px the renderer can fill,
     * defaults to the last stored mxMaxHeight.
     */
    public resize(width?: number, height?: number): void {
        const pxExternalWidth =
            width === undefined
                ? this.pxExternalWidth // then get the saved resolution
                : width;
        const pxExternalHeight =
            height === undefined
                ? this.pxExternalHeight // then get the saved resolution
                : height;

        if (width && height) {
            // they set the resolution, so save it.
            this.pxExternalWidth = pxExternalWidth;
            this.pxExternalHeight = pxExternalHeight;
        }

        const resolutionScale = this.viseur.settings.resolutionScale.get();

        // Clamp between 1 to 4096 pixels, with 4096 being the smallest max a
        // that browser can do without screwing up our scaling math
        // Note: (yes 1px x 1px would be stupid to render)
        const pxInternalWidth = clamp(
            pxExternalWidth * resolutionScale,
            1,
            4096,
        );
        const pxInternalHeight = clamp(
            pxExternalHeight * resolutionScale,
            1,
            4096,
        );

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
            if (
                pxExternalWidth !== pxInternalWidth &&
                pxExternalHeight !== pxInternalHeight
            ) {
                // have css scale it
                scaleRatio = this.getScaleRatio(
                    pxExternalWidth,
                    pxExternalHeight,
                );
                pxWidth = this.width * scaleRatio;
                pxHeight = this.height * scaleRatio;

                const cssWidth = this.pixiCanvas.attr("width") as string;
                const ratio =
                    Number(cssWidth.replace("px", "")) / this.pxWidth;
                this.pixiCanvas.css("width", `${pxWidth * ratio}px`);
            } else {
                // pixel perfect fit
                this.pixiCanvas.removeAttr("style");
            }
        }

        // now position the rendered to center it horizontally and vertically
        this.element
            .css("left", pxExternalWidth / 2 - pxWidth / 2)
            .css("top", pxExternalHeight / 2 - pxHeight / 2);

        this.drawGrid();
    }

    /**
     * Gets the scale ratio based on available width/height to draw in.
     *
     * @param width - Available pixels along x.
     * @param height - Available pixels along y.
     * @returns A number to scale the width and height both by to fill them according to our aspect ratio.
     */
    private getScaleRatio(width: number, height: number): number {
        // source: https://www.snip2code.com/Snippet/83438/A-base-implementation-of-properly-handli

        // scale to fix via width
        const pxFatness = width / height;
        const ourFatness = this.width / this.height;

        // adjust scaling
        const scaleRatio =
            ourFatness >= pxFatness
                ? width / this.width // Scale for a snug width
                : height / this.height; // Scale for a snug height

        return scaleRatio;
    }

    /**
     * Draws a grid over the scene if the setting is enabled.
     */
    private drawGrid(): void {
        this.pxGraphics.clear();

        if (!this.viseur.settings.showGrid.get()) {
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
     * Force renders everything.
     */
    private render(): void {
        // tell everything that is observing us that they need to update their PIXI objects
        this.emitRendering();
        // and now have PIXI render it
        // this.pixiApp.renderer.render(this.scene);
        // this.pixiApp.renderer.render(this.pixiApp.stage);
    }
}
