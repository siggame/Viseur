// This is a class to represent the WeatherStation object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { Building } from "./building";
import { AnarchyDelta, WeatherStationState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import * as PIXI from "pixi.js";
import { ease } from "src/utils";
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
// Set this variable to `true`, if this class should render.
const SHOULD_RENDER = undefined;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class WeatherStation extends makeRenderable(Building, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the WeatherStation (dt = 0). */
    public current: WeatherStationState | undefined;

    /** The next state of the WeatherStation (dt = 1). */
    public next: WeatherStationState | undefined;

    // <<-- Creer-Merge: variables -->>

    /** Visual display of the intensity (arrow). */
    private readonly intensitySprite: PIXI.Sprite;

    /** Visual rotation sprite for when the weather is rotated. */
    private readonly rotationSprite: PIXI.Sprite;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the WeatherStation with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this WeatherStation.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: WeatherStationState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        this.intensitySprite = this.addSprite.arrow({
            container: this.game.layers.beams,
            relativePivot: 0.5,
            position: { x: state.x + 0.5, y: state.y + 0.5 },
        });

        this.rotationSprite = this.addSprite.rotation({
            container: this.game.layers.beams,
            relativePivot: 0.5,
            position: { x: state.x + 0.5, y: state.y + 0.5 },
        });
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render WeatherStation
     * instances.
     * Leave empty if it is not being rendered.
     *
     * @param dt - A floating point number [0, 1) which represents how far into
     * the next turn that current turn we are rendering is at.
     * @param current - The current (most) game state, will be this.next if
     * this.current is undefined.
     * @param next - The next (most) game state, will be this.current if
     * this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta - The the next (most) delta, which explains what
     * happend.
     */
    public render(
        dt: number,
        current: Immutable<WeatherStationState>,
        next: Immutable<WeatherStationState>,
        delta: Immutable<AnarchyDelta>,
        nextDelta: Immutable<AnarchyDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        if (this.rotationSprite.visible) {
            const direction = this.rotationSprite.scale.x > 0 ? 1 : -1;
            this.rotationSprite.rotation =
                direction * Math.PI * ease(dt, "cubicIn");
        }

        if (this.intensitySprite.visible) {
            const direction = this.intensitySprite.rotation === 0 ? 1 : -1;
            this.intensitySprite.y =
                current.y - direction * ease(dt, "cubicIn");
        }
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this WeatherStation's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this WeatherStation instance should not be rendered,
     * such as going back in time before it existed.
     *
     * By default the super hides container.
     * If this sub class adds extra PIXI objects outside this.container, you
     * should hide those too in here.
     */
    public hideRender(): void {
        super.hideRender();

        // <<-- Creer-Merge: hide-render -->>
        // hide anything outside of `this.container`.
        // <<-- /Creer-Merge: hide-render -->>
    }

    /**
     * Invoked when the state updates.
     *
     * @param current - The current (most) game state, will be this.next if
     * this.current is undefined.
     * @param next - The next (most) game state, will be this.current if
     * this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta - The the next (most) delta, which explains what
     * happend.
     */
    public stateUpdated(
        current: Immutable<WeatherStationState>,
        next: Immutable<WeatherStationState>,
        delta: Immutable<AnarchyDelta>,
        nextDelta: Immutable<AnarchyDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        this.rotationSprite.visible = false;
        this.rotationSprite.scale.x = Math.abs(this.rotationSprite.scale.x);

        this.intensitySprite.visible = false;
        this.intensitySprite.rotation = 0;

        if (
            nextDelta.type === "ran" &&
            nextDelta.data.run.caller.id === this.id &&
            nextDelta.data.returned
        ) {
            if (nextDelta.data.run.functionName === "rotate") {
                this.rotationSprite.visible = true;
                this.rotationSprite.scale.x *= nextDelta.data.run.args
                    .counterclockwise
                    ? -1
                    : 1;
            } else {
                // functionName === "intensify"
                this.intensitySprite.visible = true;
                const negative = nextDelta.data.run.args.negative;
                // rotate the arrow 180 degrees, so flip is basically
                this.intensitySprite.rotation = negative ? Math.PI : 0;
            }
        }
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // <Joueur functions> --- functions invoked for human playable client
    // NOTE: These functions are only used 99% of the time if the game
    // supports human playable clients (like Chess).
    // If it does not, feel free to ignore these Joueur functions.

    /**
     * Bribe the weathermen to intensity the next Forecast by 1 or -1.
     *
     * @param negative - By default the intensity will be increased by 1,
     * setting this to true decreases the intensity by 1.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if the intensity was
     * changed, false otherwise.
     */
    public intensify(
        negative: boolean,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("intensify", { negative }, callback);
    }

    /**
     * Bribe the weathermen to change the direction of the next Forecast by
     * rotating it clockwise or counterclockwise.
     *
     * @param counterclockwise - By default the direction will be rotated
     * clockwise. If you set this to true we will rotate the forecast
     * counterclockwise instead.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if the rotation worked,
     * false otherwise.
     */
    public rotate(
        counterclockwise: boolean,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("rotate", { counterclockwise }, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
