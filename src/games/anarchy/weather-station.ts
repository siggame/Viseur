// This is a class to represent the WeatherStation object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { IDeltaReason } from "src/viseur/game";
import { Building } from "./building";
import { Game } from "./game";
import { IWeatherStationState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import * as PIXI from "pixi.js";
import { ease } from "src/utils";
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class WeatherStation extends Building {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /**
     * Change this to return true to actually render instances of super classes
     * @returns true if we should render game object classes of this instance,
     *          false otherwise which optimizes playback speed
     */
    public get shouldRender(): boolean {
        // <<-- Creer-Merge: should-render -->>
        return super.shouldRender; // change this to true to render all instances of this class
        // <<-- /Creer-Merge: should-render -->>
    }

    /** The instance of the game this game object is a part of */
    public readonly game: Game;

    /** The current state of the WeatherStation (dt = 0) */
    public current: IWeatherStationState;

    /** The next state of the WeatherStation (dt = 1) */
    public next: IWeatherStationState;

    // <<-- Creer-Merge: variables -->>

    /** Visual display of the intensity (arrow) */
    private intensitySprite: PIXI.Sprite;

    /** Visual rotation sprite for when the weather is rotated */
    private rotationSprite: PIXI.Sprite;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the WeatherStation with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this WeatherStation
     * @param game the game this WeatherStation is in
     */
    constructor(state: IWeatherStationState, game: Game) {
        super(state, game);

        // <<-- Creer-Merge: constructor -->>
        this.intensitySprite = this.game.resources.arrow.newSprite(this.game.layers.beams, {
            relativePivot: 0.5,
            position: {x: state.x + 0.5, y: state.y + 0.5},
        });

        this.rotationSprite = this.game.resources.rotation.newSprite(this.game.layers.beams, {
            relativePivot: 0.5,
            position: {x: state.x + 0.5, y: state.y + 0.5},
        });
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render WeatherStation
     * instances. Leave empty if it is not being rendered.
     * @param dt a floating point number [0, 1) which represents how
     * far into the next turn that current turn we are rendering is at
     * @param current the current (most) state, will be this.next if
     * this.current is undefined
     * @param next the next (most) state, will be this.current if
     * this.next is undefined
     * @param reason the reason for the current delta
     * @param nextReason the reason for the next delta
     */
    public render(dt: number, current: IWeatherStationState, next: IWeatherStationState,
                  reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>
        if (this.rotationSprite.visible) {
            const direction = this.rotationSprite.scale.x > 0 ? 1 : -1;
            this.rotationSprite.rotation = direction * Math.PI * ease(dt, "cubicIn");
        }

        if (this.intensitySprite.visible) {
            const direction = this.intensitySprite.rotation === 0 ? 1 : -1;
            this.intensitySprite.y = current.y - direction * ease(dt, "cubicIn");
        }
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this WeatherStation's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when the state updates.
     * @param current the current (most) state, will be this.next if
     * this.current is undefined
     * @param next the next (most) game state, will be this.current if
     * this.next is undefined
     * @param reason the reason for the current delta
     * @param nextReason the reason for the next delta
     */
    public stateUpdated(current: IWeatherStationState, next: IWeatherStationState,
                        reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        this.rotationSprite.visible = false;
        this.rotationSprite.scale.x = Math.abs(this.rotationSprite.scale.x);

        this.intensitySprite.visible = false;
        this.intensitySprite.rotation = 0;

        if (nextReason && nextReason.run && nextReason.run.caller === this && nextReason.returned === true) {
            if (nextReason.run.functionName === "rotate") {
                this.rotationSprite.visible = true;
                this.rotationSprite.scale.x *= nextReason.run.args.counterclockwise ? -1 : 1;
            }
            else { // "intensify"
                this.intensitySprite.visible = true;
                const negative = nextReason.run.args.negative;
                // rotate the arrow 180 degrees, so flip is basically
                this.intensitySprite.rotation = negative ? Math.PI : 0;
            }
        }
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // NOTE: past this block are functions only used 99% of the time if
    //       the game supports human playable clients (like Chess).
    //       If it does not, feel free to ignore everything past here.

    // <Joueur functions> --- functions invoked for human playable client

    /**
     * Bribe the weathermen to intensity the next Forecast by 1 or -1
     * @param negative By default the intensity will be increased by 1, setting
     * this to true decreases the intensity by 1.
     * @param callback The callback that eventually returns the return value
     * from the server. - The returned value is True if the intensity was
     * changed, false otherwise.
     */
    public intensify(negative: boolean, callback: (returned: boolean) => void): void {
        this.runOnServer("intensify", {negative}, callback);
    }

    /**
     * Bribe the weathermen to change the direction of the next Forecast by
     * rotating it clockwise or counterclockwise.
     * @param counterclockwise By default the direction will be rotated
     * clockwise. If you set this to true we will rotate the forecast
     * counterclockwise instead.
     * @param callback The callback that eventually returns the return value
     * from the server. - The returned value is True if the rotation worked,
     * false otherwise.
     */
    public rotate(counterclockwise: boolean, callback: (returned: boolean) => void): void {
        this.runOnServer("rotate", {counterclockwise}, callback);
    }

    // </Joueur functions>

    /**
     * Invoked when the right click menu needs to be shown.
     * @returns an array of context menu items, which can be
     *          {text, icon, callback} for items, or "---" for a separator
     */
    protected getContextMenu(): MenuItems {
        const menu = super.getContextMenu();

        // <<-- Creer-Merge: get-context-menu -->>
        // add context items to the menu here
        // <<-- /Creer-Merge: get-context-menu -->>

        return menu;
    }

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
