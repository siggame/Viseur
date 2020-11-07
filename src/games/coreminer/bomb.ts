// This is a class to represent the Bomb object in the game.
// If you want to render it in the game do so here.
import { Immutable, pixiFade } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { BombState, CoreminerDelta } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
import { ease } from "src/utils";
import { TileState } from "./state-interfaces";
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
// Set this variable to `true`, if this class should render.
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Bomb extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here

    /** Bomb scale. */
    private static readonly SCALE = 1;
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Bomb (dt = 0). */
    public current: BombState | undefined;

    /** The next state of the Bomb (dt = 1). */
    public next: BombState | undefined;

    // <<-- Creer-Merge: variables -->>
    // You can add additional member variables here

    /** This Bomb's sprite. */
    public bombSprite: PIXI.Sprite;

    /** This Bomb's timer. */
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Bomb with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Bomb.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: BombState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        // You can initialize your new Bomb here.
        this.container.scale.set(Bomb.SCALE, Bomb.SCALE);
        // this.container.position.set(state.tile.x, state.tile.y);
        this.container.setParent(this.game.layers.game);
        this.bombSprite = this.addSprite.bomb();
        this.container.visible = false;
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Bomb
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
        current: Immutable<BombState>,
        next: Immutable<BombState>,
        delta: Immutable<CoreminerDelta>,
        nextDelta: Immutable<CoreminerDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        // render where the Bomb is
        pixiFade(this.bombSprite, dt, current.timer, next.timer);
        if (!next.tile) {
            this.container.visible = false;
            return;
        }

        this.container.visible = true;
        let fellTile: TileState | undefined;
        if (
            nextDelta.type === "ran" &&
            nextDelta.data.run.functionName === "dump"
        ) {
            const { tile } = nextDelta.data.run.args;
            if (tile.id !== next.tile.id) {
                fellTile = tile.getCurrentMostState();
            }
        }

        let startTile = current.tile;

        if (fellTile) {
            startTile = fellTile;
        }
        this.container.position.set(
            ease(startTile.x, next.tile.x, dt),
            ease(startTile.y, next.tile.y, dt),
        );
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Bomb's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Bomb instance should not be rendered,
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
        current: Immutable<BombState>,
        next: Immutable<BombState>,
        delta: Immutable<CoreminerDelta>,
        nextDelta: Immutable<CoreminerDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Bomb based off its states
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
