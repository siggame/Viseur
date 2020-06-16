// This is a class to represent the Tile object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { NecrowarDelta, TileState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import * as PIXI from "pixi.js";
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
// Set this variable to `true`, if this class should render.
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Tile extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Tile (dt = 0). */
    public current: TileState | undefined;

    /** The next state of the Tile (dt = 1). */
    public next: TileState | undefined;

    // <<-- Creer-Merge: variables -->>
    /** The castle sprite. */
    public readonly castle: PIXI.Sprite | undefined;
    /** The grass sprite. */
    public readonly grass: PIXI.Sprite | undefined;
    /** The islandGoldMine sprite. */
    public readonly islandGoldmine: PIXI.Sprite | undefined;
    /** The goldmine sprite. */
    public readonly goldmine: PIXI.Sprite | undefined;
    /** The unitSpawn sprite. */
    public readonly unitSpawn: PIXI.Sprite | undefined;
    /** The workerSpawn sprite. */
    public readonly workerSpawn: PIXI.Sprite | undefined;
    /** The path sprite. */
    public readonly path: PIXI.Sprite | undefined;
    /** The river sprite. */
    public readonly river: PIXI.Sprite | undefined;
    /** The container for all unit sprites. */
    private readonly unitContainer: PIXI.Container;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Tile with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Tile.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: TileState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        this.container.setParent(this.game.layers.background);
        this.container.position.set(state.x, state.y);

        // if (state.owner) {
        //     this.ownerID = state.owner.id;
        // }

        this.unitContainer = new PIXI.Container();
        this.unitContainer.setParent(this.game.layers.game);
        this.unitContainer.position.x = this.container.position.x;
        this.unitContainer.position.y = this.container.position.y;

        if (state.isCastle) {
            this.castle = this.addSprite.path({ container: this.container });
            this.castle = this.addSprite.castle({
                container: this.unitContainer,
            });
            this.unitContainer.position.x -= 0.5;
            this.unitContainer.position.y -= 0.7;
            this.unitContainer.scale.x *= 2;
            this.unitContainer.scale.y *= 2;
        }
        if (state.isIslandGoldMine) {
            this.islandGoldmine = this.addSprite.islandGoldmine({
                container: this.unitContainer,
            });
        }
        if (state.isGoldMine) {
            this.goldmine = this.addSprite.islandGoldmine({
                container: this.unitContainer,
            });
        }
        if (state.isGrass) {
            this.grass = this.addSprite.grass();
        }
        if (state.isPath) {
            this.path = this.addSprite.path();
        } else if (state.isRiver) {
            this.river = this.addSprite.water();
        }
        if (state.isUnitSpawn) {
            this.unitSpawn = this.addSprite.grass();
            this.unitSpawn = this.addSprite.unitSpawn();
        }
        if (state.isWorkerSpawn) {
            this.workerSpawn = this.addSprite.workerSpawn();
        }
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Tile
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
        current: Immutable<TileState>,
        next: Immutable<TileState>,
        delta: Immutable<NecrowarDelta>,
        nextDelta: Immutable<NecrowarDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        // render where the Tile is
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Tile's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Tile instance should not be rendered,
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
        current: Immutable<TileState>,
        next: Immutable<TileState>,
        delta: Immutable<NecrowarDelta>,
        nextDelta: Immutable<NecrowarDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Tile based off its states
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
     * Resurrect the corpses on this tile into Zombies.
     *
     * @param num - Number of zombies to resurrect.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successful res, false
     * otherwise.
     */
    public res(num: number, callback: (returned: boolean) => void): void {
        this.runOnServer("res", { num }, callback);
    }

    /**
     * Spawns a fighting unit on the correct tile.
     *
     * @param title - The title of the desired unit type.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully spawned,
     * false otherwise.
     */
    public spawnUnit(
        title: string,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("spawnUnit", { title }, callback);
    }

    /**
     * Spawns a worker on the correct tile.
     *
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully spawned,
     * false otherwise.
     */
    public spawnWorker(callback: (returned: boolean) => void): void {
        this.runOnServer("spawnWorker", {}, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
