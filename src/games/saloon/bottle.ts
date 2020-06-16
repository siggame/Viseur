// This is a class to represent the Bottle object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { BottleState, SaloonDelta } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import { ease } from "src/utils";
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Bottle extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Bottle (dt = 0). */
    public current: BottleState | undefined;

    /** The next state of the Bottle (dt = 1). */
    public next: BottleState | undefined;

    // <<-- Creer-Merge: variables -->>

    /** The bottle's display as a sprite. */
    private readonly sprite = this.addSprite.bottle({
        anchor: 0.5,
        position: { x: 0.5, y: 0.5 },
        relativeScale: 0.75,
    });

    /** The last DT so pausing doesn't cause us to jump in time. */
    private lastDT = 0;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Bottle with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Bottle.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: BottleState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Bottle
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
        current: Immutable<BottleState>,
        next: Immutable<BottleState>,
        delta: Immutable<SaloonDelta>,
        nextDelta: Immutable<SaloonDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        this.container.visible = !current.isDestroyed;
        if (current.isDestroyed) {
            return; // no need to render further
        }

        this.container.alpha = 1;

        // if for the next state it died, fade it out
        let nextTile = next.tile;
        if (next.isDestroyed) {
            nextTile = current.tile; // it would normally be null, this way we can render it on its tile of death
            this.container.alpha = ease(1 - dt); // fade it out
        }

        // if this did not exist at first, fade it in
        if (!this.current) {
            this.container.alpha = ease(dt);
        }

        // rotate the bottle based on real tile when not paused
        if (this.lastDT !== dt) {
            this.lastDT = dt;
            // rotate at a constant rate, not dependent on dt
            this.sprite.rotation = (Math.PI * new Date().getTime() * 2) / 1000;
        }

        this.container.position.set(
            ease(current.tile.x, nextTile.x, dt, "linear"),
            ease(current.tile.y, nextTile.y, dt, "linear"),
        );
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Bottle's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Bottle instance should not be rendered,
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
        current: Immutable<BottleState>,
        next: Immutable<BottleState>,
        delta: Immutable<SaloonDelta>,
        nextDelta: Immutable<SaloonDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Bottle based off its states
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
