import * as Color from "color";
import * as PIXI from "pixi.js";
import { clamp, colorPixiObject } from "src/utils";
import { BaseGame } from "./base-game";

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
    settingKey?: string;

    /** Invert the setting value subscribed to */
    settingInvert?: boolean;
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
    constructor(parent: PIXI.Container, game: BaseGame, options?: IGameBarOptions) {
        options = options || {};
        options.width = options.width || 0.9;
        options.height = options.height || 0.06667;
        options.max = options.max || 1;
        options.foregroundColor = options.foregroundColor || Color("#44F444");
        options.backgroundColor = options.backgroundColor || Color("black");

        this.container.setParent(parent);
        this.game = game;

        this.background = this.game.renderer.newSprite("", this.container);
        this.background.height = options.height;
        this.background.width = options.width;
        colorPixiObject(this.background, options.backgroundColor);

        this.foreground = this.game.renderer.newSprite("", this.container);
        this.foreground.height = options.height;
        this.foreground.width = options.width;
        colorPixiObject(this.foreground, options.foregroundColor);

        const widthDiff = this.container.width - options.width;
        this.container.position.set(widthDiff / 2, 0);

        if (options.settingKey) {
            this.game.settingsManager.onChanged(options.settingKey, (newValue: boolean) => {
                if (options && options.settingInvert) {
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
    public recolor(foregroundColor?: Color, backgroundColor?: Color): void {
        if (foregroundColor) {
            colorPixiObject(this.foreground, foregroundColor);
        }

        if (backgroundColor) {
            colorPixiObject(this.background, backgroundColor);
        }
    }
}
