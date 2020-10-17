// This is a class to represent the Tower object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { NecrowarDelta, TileState, TowerState } from "./state-interfaces";

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
export class Tower extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Tower (dt = 0). */
    public current: TowerState | undefined;

    /** The next state of the Tower (dt = 1). */
    public next: TowerState | undefined;

    // <<-- Creer-Merge: variables -->>
    /** If Archer sprite. */
    public readonly archer: PIXI.Sprite | undefined;
    /** If Aoe sprite. */
    public readonly aoe: PIXI.Sprite | undefined;
    /** If Cleansing sprite. */
    public readonly cleansing: PIXI.Sprite | undefined;
    /** If Ballista sprite. */
    public readonly ballista: PIXI.Sprite | undefined;
    /** The id of the owner of this unit, for recoloring. */
    public ownerID: string;
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Tower with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Tower.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: TowerState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        this.ownerID = state.owner.id;
        this.container.setParent(this.game.layers.game);

        if (state.job.title === "arrow") {
            this.archer = this.addSprite.archerTower();
        } else if (state.job.title === "aoe") {
            this.aoe = this.addSprite.aoe();
        } else if (state.job.title === "cleansing") {
            this.cleansing = this.addSprite.cleansingTower();
        } else if (state.job.title === "ballista") {
            this.ballista = this.addSprite.ballistaTower();
        }

        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Tower
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
        current: Immutable<TowerState>,
        next: Immutable<TowerState>,
        delta: Immutable<NecrowarDelta>,
        nextDelta: Immutable<NecrowarDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        if (!next.tile) {
            this.container.visible = false;

            return;
        }
        this.container.visible = true;
        this.container.position.set(
            ease(current.tile.x, next.tile.x, dt),
            ease(current.tile.y, next.tile.y, dt),
        );
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Tower's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Tower instance should not be rendered,
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
        current: Immutable<TowerState>,
        next: Immutable<TowerState>,
        delta: Immutable<NecrowarDelta>,
        nextDelta: Immutable<NecrowarDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Tower based off its states
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
     * Attacks an enemy unit on an tile within it's range.
     *
     * @param tile - The Tile to attack.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully attacked,
     * false otherwise.
     */
    public attack(
        tile: TileState,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("attack", { tile }, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
