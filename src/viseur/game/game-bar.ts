import { clamp } from "lodash";
import * as PIXI from "pixi.js";
import { ColorTint, getTintFromColor, Immutable } from "src/utils";
import { ViseurInstance } from "src/viseur/constructed";
import { BaseSetting } from "src/viseur/settings";

/** The optional args for a game bar. */
export interface GameBarOptions {
    /** The width of the bar. */
    width?: number;

    /** The height of the bar. */
    height?: number;

    /** The maximum value to be considered 100%. */
    max?: number;

    /** The foreground color of the bar. */
    foregroundColor?: ColorTint;

    /** The background color of the bar. */
    backgroundColor?: ColorTint;

    /** The setting to subscribe to to show/hide. */
    visibilitySetting?: BaseSetting<boolean>;

    /** Invert the setting value subscribed to. */
    invertSetting?: boolean;
}

/** A bar for a number such as health on top of a BaseGameObject. */
export class GameBar {
    /** The root container for all elements of this bar. */
    private readonly container = new PIXI.Container();

    /** The background sprite. */
    private readonly foreground: PIXI.Sprite;

    /** The background sprite. */
    private readonly background: PIXI.Sprite;

    /** The display width of the bar. */
    private readonly width: number;

    /** The maximum value of the bar. */
    private readonly max: number;

    /**
     * Creates a bar to represent some game number.
     *
     * @param parent - The parent pixi object.
     * @param options - Optional options to initialize the bar with.
     */
    constructor(
        parent: PIXI.Container,
        options: Immutable<GameBarOptions> = {},
    ) {
        const viseur = ViseurInstance;
        if (!viseur || !viseur.game) {
            throw new Error("Cannot create a game bar without a game!");
        }

        const opts = {
            container: this.container,
            height: 0.06667,
            width: 0.9,
            ...options,
        };

        this.width = opts.width;
        this.container.setParent(parent);
        this.max = opts.max || 1;

        const { blank } = viseur.game.resources;
        this.background = blank.newSprite(opts);
        this.foreground = blank.newSprite(opts);

        this.recolor(
            opts.foregroundColor || 0x044f444, // green-ish
            opts.backgroundColor || 0x00000,
        );

        const widthDiff = (parent.width || 1) - this.width;
        this.container.position.set(widthDiff / 2, 0);

        if (opts.visibilitySetting) {
            opts.visibilitySetting.changed.on((newValue) => {
                let val = Boolean(newValue);
                if (opts && opts.invertSetting) {
                    val = !val;
                }

                this.setVisible(val);
            });
            this.setVisible(opts.visibilitySetting.get());
        }
    }

    /**
     * Sets if the bar is visible.
     *
     * @param visible - True if visible, false otherwise.
     */
    public setVisible(visible: boolean): void {
        this.container.visible = visible;
    }

    /**
     * Updates the value of the bar, which will expand/contract the foreground.
     *
     * @param value - The new value to update the foreground bar to, relative
     * to this bar's max.
     */
    public update(value: number): void {
        const clamped = clamp(value, 0, this.max);
        this.foreground.width = this.width * (clamped / this.max);
    }

    /**
     * Recolors the parts of the bar.
     *
     * @param foregroundColor - The Color to recolor the foreground part of the
     * bar to.
     * @param backgroundColor - The Color to recolor the background part of the
     * bar to.
     */
    public recolor(
        foregroundColor?: ColorTint,
        backgroundColor?: ColorTint,
    ): void {
        if (foregroundColor !== undefined) {
            this.foreground.tint = getTintFromColor(foregroundColor);
        }

        if (backgroundColor !== undefined) {
            this.background.tint = getTintFromColor(backgroundColor);
        }
    }
}
