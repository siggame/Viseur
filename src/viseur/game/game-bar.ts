import clamp from "lodash/clamp";
import * as PIXI from "pixi.js";
import { ColorTint, getTintFromColor } from "src/utils";
import { Viseur, viseurConstructed } from "src/viseur";
import { BaseSetting } from "src/viseur/settings";

// kind of sketchy
let viseur: Viseur | undefined;
viseurConstructed.once((vis) => {
    viseur = vis;
});

/** The optional args for a game bar */
export interface IGameBarOptions {
    /** The width of the bar */
    width?: number;

    /** The height of the bar */
    height?: number;

    /** The maximum value to be considered 100% */
    max?: number;

    /** The foreground color of the bar */
    foregroundColor?: ColorTint;

    /** The background color of the bar */
    backgroundColor?: ColorTint;

    /** The setting to subscribe to to show/hide */
    visibilitySetting?: BaseSetting<boolean>;

    /** Invert the setting value subscribed to */
    invertSetting?: boolean;
}

/** A bar for a number such as health on top of a BaseGameObject */
export class GameBar {
    /** The root container for all elements of this bar */
    private readonly container = new PIXI.Container();

    /** The background sprite */
    private readonly foreground: PIXI.Sprite;

    /** The background sprite */
    private readonly background: PIXI.Sprite;

    /** The display width of the bar */
    private readonly width: number;

    /** The maximum value of the bar */
    private readonly max: number;

    /**
     * Creates a bar to represent some game number.
     *
     * @param parent - The parent pixi object.
     * @param options - Optional options to initialize the bar with.
     */
    constructor(parent: PIXI.Container, options: IGameBarOptions = {}) {
        if (!viseur || !viseur.game) {
            throw new Error("Cannot create a game bar without a game!");
        }

        options.height = options.height || 0.06667;

        options.width = options.width || 0.9;
        this.width = options.width;
        this.container.setParent(parent);
        this.max = options.max || 1;

        const { blank } = viseur.game.resources;
        this.background = blank.newSprite(this.container, options);
        this.foreground = blank.newSprite(this.container, options);

        this.recolor(
            options.foregroundColor || 0x044F444, // green-ish
            options.backgroundColor || 0x00000,
        );

        const widthDiff = parent.width - this.width;
        this.container.position.set(widthDiff / 2, 0);

        if (options.visibilitySetting) {
            options.visibilitySetting.changed.on((newValue) => {
                let val = Boolean(newValue);
                if (options && options.invertSetting) {
                    val = !val;
                }

                this.setVisible(val);
            });
            this.setVisible(options.visibilitySetting.get());
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
     * @param value The new value to update the foreground bar to, relative to
     * this bar's max.
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
