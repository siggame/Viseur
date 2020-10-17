// This is a class to represent the Body object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { BodyState, StardashDelta } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import * as PIXI from "pixi.js";
import { ease } from "src/utils";
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
// Set this variable to `true`, if this class should render.
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Body extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Body (dt = 0). */
    public current: BodyState | undefined;

    /** The next state of the Body (dt = 1). */
    public next: BodyState | undefined;

    // <<-- Creer-Merge: variables -->>
    /** Sprites for bodies. */
    public bodiesSprite: PIXI.Sprite;

    /** Tracks if has moved. */
    public hasMoved: boolean;
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Body with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Body.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: BodyState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        // You can initialize your new Body here.
        const bodiesContainer = new PIXI.Container();
        bodiesContainer.setParent(this.container);
        if (state.materialType === "genarium") {
            this.bodiesSprite = this.addSprite.genarium({
                relativePivot: 0.5,
            });
        } else if (state.materialType === "rarium") {
            this.bodiesSprite = this.addSprite.rarium({
                relativePivot: 0.5,
            });
        } else if (state.materialType === "legendarium") {
            this.bodiesSprite = this.addSprite.legendarium({
                relativePivot: 0.5,
            });
        } else if (state.materialType === "mythicite") {
            this.bodiesSprite = this.addSprite.mythicite({
                relativePivot: 0.5,
            });
        } else {
            this.bodiesSprite = this.addSprite.blank();
        }
        this.bodiesSprite.scale.x *= state.radius * this.game.scaler;
        this.bodiesSprite.scale.y *= state.radius * this.game.scaler;
        this.hasMoved = false;
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Body
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
        current: Immutable<BodyState>,
        next: Immutable<BodyState>,
        delta: Immutable<StardashDelta>,
        nextDelta: Immutable<StardashDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        if (current.x !== next.x) {
            this.hasMoved = true;
        }
        if (next.amount === 0 || this.hasMoved === false) {
            this.container.visible = false;

            return;
        }
        this.bodiesSprite.position.set(
            ease(current.x, next.x, dt),
            ease(current.y, next.y, dt),
        );
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Body's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Body instance should not be rendered,
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
        current: Immutable<BodyState>,
        next: Immutable<BodyState>,
        delta: Immutable<StardashDelta>,
        nextDelta: Immutable<StardashDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Body based off its states
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
     * The x value of this body a number of turns from now. (0-how many you
     * want).
     *
     * @param num - The number of turns in the future you wish to check.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is The x position of the body the
     * input number of turns in the future.
     */
    public nextX(num: number, callback: (returned: number) => void): void {
        this.runOnServer("nextX", { num }, callback);
    }

    /**
     * The x value of this body a number of turns from now. (0-how many you
     * want).
     *
     * @param num - The number of turns in the future you wish to check.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is The x position of the body the
     * input number of turns in the future.
     */
    public nextY(num: number, callback: (returned: number) => void): void {
        this.runOnServer("nextY", { num }, callback);
    }

    /**
     * Spawn a unit on some value of this celestial body.
     *
     * @param x - The x value of the spawned unit.
     * @param y - The y value of the spawned unit.
     * @param title - The job title of the unit being spawned.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully taken,
     * false otherwise.
     */
    public spawn(
        x: number,
        y: number,
        title: string,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("spawn", { x, y, title }, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
