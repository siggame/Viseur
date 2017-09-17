// This is a class to represent the Beaver object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { IDeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { GameObject } from "./game-object";
import { IBeaverState, ISpawnerState, ITileState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class Beaver extends GameObject {
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

    /** The current state of the Beaver (dt = 0) */
    public current: IBeaverState;

    /** The next state of the Beaver (dt = 1) */
    public next: IBeaverState;

    // <<-- Creer-Merge: variables -->>
    // You can add additional member variables here
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Beaver with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this Beaver
     * @param game the game this Beaver is in
     */
    constructor(state: IBeaverState, game: Game) {
        super(state, game);

        // <<-- Creer-Merge: constructor -->>
        // You can initialize your new Beaver here.
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Beaver
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
    public render(dt: number, current: IBeaverState, next: IBeaverState,
                  reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>
        // render where the Beaver is
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this Beaver's sprites.
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
    public stateUpdated(current: IBeaverState, next: IBeaverState,
                        reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        // update the Beaver based off its states
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
     * Attacks another adjacent beaver.
     * @param beaver The Beaver to attack. Must be on an adjacent Tile.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully attacked,
     * false otherwise.
     */
    public attack(beaver: IBeaverState, callback?: (returned: boolean) => void): void {
        this.runOnServer("attack", {beaver}, callback);
    }

    /**
     * Builds a lodge on the Beavers current Tile.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully built a
     * lodge, false otherwise.
     */
    public buildLodge(callback?: (returned: boolean) => void): void {
        this.runOnServer("buildLodge", {}, callback);
    }

    /**
     * Drops some of the given resource on the beaver's Tile.
     * @param tile The Tile to drop branches/food on. Must be the same Tile that
     * the Beaver is on, or an adjacent one.
     * @param resource The type of resource to drop ('branch' or 'food').
     * @param amount The amount of the resource to drop, numbers <= 0 will drop
     * all the resource type.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully dropped the
     * resource, false otherwise.
     */
    public drop(tile: ITileState, resource: string, amount: number, callback?:
                (returned: boolean) => void,
    ): void {
        this.runOnServer("drop", {tile, resource, amount}, callback);
    }

    /**
     * Harvests the branches or food from a Spawner on an adjacent Tile.
     * @param spawner The Spawner you want to harvest. Must be on an adjacent
     * Tile.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully harvested,
     * false otherwise.
     */
    public harvest(spawner: ISpawnerState, callback?: (returned: boolean) =>
                   void,
    ): void {
        this.runOnServer("harvest", {spawner}, callback);
    }

    /**
     * Moves this Beaver from its current Tile to an adjacent Tile.
     * @param tile The Tile this Beaver should move to.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if the move worked, false
     * otherwise.
     */
    public move(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("move", {tile}, callback);
    }

    /**
     * Picks up some branches or food on the beaver's tile.
     * @param tile The Tile to pickup branches/food from. Must be the same Tile
     * that the Beaver is on, or an adjacent one.
     * @param resource The type of resource to pickup ('branch' or 'food').
     * @param amount The amount of the resource to drop, numbers <= 0 will
     * pickup all of the resource type.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully picked up a
     * resource, false otherwise.
     */
    public pickup(tile: ITileState, resource: string, amount: number, callback?:
                  (returned: boolean) => void,
    ): void {
        this.runOnServer("pickup", {tile, resource, amount}, callback);
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
