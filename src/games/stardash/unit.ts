// This is a class to represent the Unit object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import {
    BodyState,
    ProjectileState,
    StardashDelta,
    UnitState,
} from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import * as PIXI from "pixi.js";
import { ease } from "src/utils";
import { GameBar } from "src/viseur/game";
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
// Set this variable to `true`, if this class should render.
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Unit extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Unit (dt = 0). */
    public current: UnitState | undefined;

    /** The next state of the Unit (dt = 1). */
    public next: UnitState | undefined;

    // <<-- Creer-Merge: variables -->>
    // You can add additional member variables here
    /** The owner's ID. */
    public ownerID: string;

    /** The sprite of the job. */
    public jobSprite: PIXI.Sprite;

    /** The health bar. */
    public healthBar: GameBar;

    /** The shield sprite. */
    public shield: PIXI.Sprite;

    /** The offset for rotation. */
    public readonly rotationOffset: number = Math.asin(1);
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Unit with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Unit.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: UnitState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        // You can initialize your new Unit here.
        this.ownerID = state.owner.id;
        this.container.scale.set(1, 1);
        const jobContainer = new PIXI.Container();
        jobContainer.setParent(this.container);

        this.shield = this.addSprite.shield({
            relativeScale: this.game.scaler * 105,
            relativePivot: 0.5,
        });
        this.shield.setParent(this.game.layers.shield);
        this.shield.tint = this.game.getPlayersColor(this.ownerID).rgbNumber();
        this.shield.alpha = 0.6;
        this.shield.visible = false;

        if (state.job.id === "2") {
            this.jobSprite = this.addSprite.corvette({
                relativePivot: 0.5,
            });
        } else if (state.job.id === "3") {
            this.jobSprite = this.addSprite.missleboat({
                relativePivot: 0.5,
            });
        } else if (state.job.id === "4") {
            this.jobSprite = this.addSprite.martyr({
                relativePivot: 0.5,
            });
            this.shield.visible = true;
            this.shield.x = this.container.x;
            this.shield.y = this.container.y;
        } else if (state.job.id === "5") {
            this.jobSprite = this.addSprite.transport({
                relativePivot: 0.5,
            });
        } else if (state.job.id === "6") {
            this.jobSprite = this.addSprite.miner({
                relativePivot: 0.5,
            });
        } else {
            this.jobSprite = this.addSprite.test({
                relativePivot: 0.5,
            });
        }
        this.jobSprite.scale.x *= this.game.scaler * 20;
        this.jobSprite.scale.y *= this.game.scaler * 20;

        // offset ships to point to the sun when spawned.
        this.jobSprite.rotation +=
            this.rotationOffset * (this.ownerID === "1" ? -1 : 1);

        const barContainer = new PIXI.Container();
        barContainer.setParent(this.container);
        barContainer.position.y -= 30;
        barContainer.position.x -= 24;
        this.healthBar = new GameBar(barContainer, {
            max: state.job.energy,
            visibilitySetting: this.game.settings.displayHealthBars,
            backgroundColor: "grey",
            height: 10,
            width: 50,
        });
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Unit
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
        current: Immutable<UnitState>,
        next: Immutable<UnitState>,
        delta: Immutable<StardashDelta>,
        nextDelta: Immutable<StardashDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        // render where the Unit is
        if (next.energy <= 0) {
            this.container.visible = false;
            this.shield.visible = false;

            return;
        }

        this.container.position.set(
            ease(current.x, next.x, dt),
            ease(current.y, next.y, dt),
        );

        if (next.shield > 0) {
            this.shield.visible = true;
            this.shield.x = this.container.x;
            this.shield.y = this.container.y;
        } else {
            this.shield.visible = false;
        }

        this.healthBar.update(ease(current.energy, next.energy, dt));
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Unit's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        const color = this.game.getPlayersColor(this.ownerID).rgbNumber();
        this.jobSprite.tint = color;
        this.healthBar.recolor(color);
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Unit instance should not be rendered,
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
        current: Immutable<UnitState>,
        next: Immutable<UnitState>,
        delta: Immutable<StardashDelta>,
        nextDelta: Immutable<StardashDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Unit based off its states
        // if there was a change in the location...
        if (current.x !== next.x || current.y !== next.y) {
            // get the angle between the two points(fancy stuff here)
            const rot = Math.atan2(next.y - current.y, next.x - current.x);
            // apply rotation with consideration to offset we did in initialization.
            this.jobSprite.rotation = rot + this.rotationOffset;
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
     * Attacks the specified unit.
     *
     * @param enemy - The Unit being attacked.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully attacked,
     * false otherwise.
     */
    public attack(
        enemy: UnitState,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("attack", { enemy }, callback);
    }

    /**
     * Causes the unit to dash towards the designated destination.
     *
     * @param x - The x value of the destination's coordinates.
     * @param y - The y value of the destination's coordinates.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if it moved, false
     * otherwise.
     */
    public dash(
        x: number,
        y: number,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("dash", { x, y }, callback);
    }

    /**
     * Allows a miner to mine a asteroid.
     *
     * @param body - The object to be mined.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully acted,
     * false otherwise.
     */
    public mine(body: BodyState, callback: (returned: boolean) => void): void {
        this.runOnServer("mine", { body }, callback);
    }

    /**
     * Moves this Unit from its current location to the new location specified.
     *
     * @param x - The x value of the destination's coordinates.
     * @param y - The y value of the destination's coordinates.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if it moved, false
     * otherwise.
     */
    public move(
        x: number,
        y: number,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("move", { x, y }, callback);
    }

    /**
     * Tells you if your ship can move to that location from were it is without
     * clipping the sun.
     *
     * @param x - The x position of the location you wish to arrive.
     * @param y - The y position of the location you wish to arrive.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if pathable by this unit,
     * false otherwise.
     */
    public safe(
        x: number,
        y: number,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("safe", { x, y }, callback);
    }

    /**
     * Attacks the specified projectile.
     *
     * @param missile - The projectile being shot down.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully attacked,
     * false otherwise.
     */
    public shootdown(
        missile: ProjectileState,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("shootdown", { missile }, callback);
    }

    /**
     * Grab materials from a friendly unit. Doesn't use a action.
     *
     * @param unit - The unit you are grabbing the resources from.
     * @param amount - The amount of materials to you with to grab. Amounts <= 0
     * will pick up all the materials that the unit can.
     * @param material - The material the unit will pick up. 'genarium',
     * 'rarium', 'legendarium', or 'mythicite'.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully taken,
     * false otherwise.
     */
    public transfer(
        unit: UnitState,
        amount: number,
        material: "genarium" | "rarium" | "legendarium" | "mythicite",
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("transfer", { unit, amount, material }, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
