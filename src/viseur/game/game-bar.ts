import * as Color from "color";
import * as PIXI from "pixi.js";
import { clamp, ColorTint, getTintFromColor } from "src/utils";
import { BaseSetting } from "src/viseur/settings";
import { BaseGame } from "./base-game";

/** The optional args for a game bar */
export interface IGameBarOptions {
    /** The width of the bar */
    width?: number;

    /** The height of the bar */
    height?: number;

    /** The maximum value to be considered 100% */
    max?: number;

    /** The foreground color of the bar */
    foregroundColor?: Color;

    /** The background color of the bar */
    backgroundColor?: Color;

    /** The setting to subscribe to to show/hide */
    visibilitySetting?: BaseSetting;

    /** Invert the setting value subscribed to */
    invertSetting?: boolean;
}

/** A bar for a number such as health on top of a BaseGameObject */
export class GameBar {
    /** The root container for all elements of this bar */
    private readonly container = new PIXI.Container();

    /** The game reference */
    private readonly game: BaseGame;

    /** The background sprite */
    private readonly foreground: PIXI.Sprite;

    /** The background sprite */
    private readonly background: PIXI.Sprite;

    /** The display width of the bar */
    private readonly width: number;

    /** The maximum value of the bar */
    private readonly max: number;

    /**
     * Creates a bar to represent some game number
     * @param parent the parent pixi object
     * @param game the game reference this bar is in
     * @param options options to initialize the bar
     */
    constructor(parent: PIXI.Container, game: BaseGame, options: IGameBarOptions = {}) {
        options.height = options.height || 0.06667;

        this.width = options.width || 0.9;
        this.container.setParent(parent);
        this.game = game;
        this.max = options.max || 1;

        this.background = this.game.resources.blank.newSprite(this.container, options);
        this.foreground = this.game.resources.blank.newSprite(this.container, options);

        this.recolor(options.foregroundColor || 0x044F444, options.backgroundColor || 0x00000);

        const widthDiff = this.container.width - this.width;
        this.container.position.set(widthDiff / 2, 0);

        if (options.visibilitySetting) {
            options.visibilitySetting.changed.on((newValue: any) => {
                newValue = Boolean(newValue);
                if (options && options.invertSetting) {
                    newValue = !newValue;
                }

                this.setVisible(newValue);
            });
        }
    }

    /**
     * Sets if the bar is visible
     * @param visible true if visible, false otherwise
     */
    public setVisible(visible: boolean): void {
        this.container.visible = visible;
    }

    /**
     * Updates the value of the bar, which will expand/contract the foreground
     * @param value the new value to update the foreground bar to, relative to this bar's max
     */
    public update(value: number): void {
        value = clamp(value, 0, this.max);
        this.foreground.width = this.width * (value / this.max);
    }

    /**
     * Recolors the parts of the bar
     * @param {Color} foregroundColor the Color to recolor the foreground part of the bar to
     * @param {Color} backgroundColor the Color to recolor the background part of the bar to
     */
    public recolor(foregroundColor?: ColorTint, backgroundColor?: ColorTint): void {
        if (foregroundColor !== undefined) {
            this.foreground.tint = getTintFromColor(foregroundColor);
        }

        if (backgroundColor !== undefined) {
            this.background.tint = getTintFromColor(backgroundColor);
        }
    }
}
