// This is a class to represent the Unit object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { IDeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { GameObject } from "./game-object";
import { IJobState, ITileState, IUnitState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class Unit extends GameObject {
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

    /** The current state of the Unit (dt = 0) */
    public current: IUnitState;

    /** The next state of the Unit (dt = 1) */
    public next: IUnitState;

    // <<-- Creer-Merge: variables -->>
    // You can add additional member variables here
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Unit with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this Unit
     * @param game the game this Unit is in
     */
    constructor(state: IUnitState, game: Game) {
        super(state, game);

        // <<-- Creer-Merge: constructor -->>
        // You can initialize your new Unit here.
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Unit
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
    public render(dt: number, current: IUnitState, next: IUnitState,
                  reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>
        // render where the Unit is
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this Unit's sprites.
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
    public stateUpdated(current: IUnitState, next: IUnitState,
                        reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        // update the Unit based off its states
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
     * Attacks an adjacent tile. Costs an action for each unit in this squad.
     * Units in this squad without an action don't participate in combat. Units
     * in the squad cannot move after performing this action.
     * @param tile The Tile to attack.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully attacked,
     * false otherwise.
     */
    public attack(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("attack", {tile}, callback);
    }

    /**
     * Changes this Unit's Job. Must be at max energy (1.0) to change Jobs.
     * @param job The Job to change to.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully changed
     * Jobs, false otherwise.
     */
    public changeJob(job: IJobState, callback?: (returned: boolean) => void): void {
        this.runOnServer("changeJob", {job}, callback);
    }

    /**
     * Constructs a structure on an adjacent Tile.
     * @param tile The Tile to construct the structure on. It must have enough
     * materials on it for a structure to be constructed.
     * @param type The type of structure to construct on that tile.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully constructed
     * a structure, false otherwise.
     */
    public construct(tile: ITileState, type: string, callback?: (returned:
                     boolean) => void,
    ): void {
        this.runOnServer("construct", {tile, type}, callback);
    }

    /**
     * Converts an adjacent Unit to your side.
     * @param tile The Tile with the Unit to convert.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully converted,
     * false otherwise.
     */
    public convert(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("convert", {tile}, callback);
    }

    /**
     * Removes materials from an adjacent Tile's Structure. Soldiers do not gain
     * materials from doing this, but can deconstruct friendly Structures as
     * well.
     * @param tile The Tile to deconstruct. It must have a Structure on it.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully
     * deconstructed, false otherwise.
     */
    public deconstruct(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("deconstruct", {tile}, callback);
    }

    /**
     * Drops some of the given resource on or adjacent to the unit's Tile. Does
     * not count as an action.
     * @param tile The Tile to drop materials/food on.
     * @param resource The type of resource to drop ('material' or 'food').
     * @param amount The amount of the resource to drop, numbers <= 0 will drop
     * all of the resource.
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
     * Harvests the food on an adjacent Tile.
     * @param tile The Tile you want to harvest.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully harvested,
     * false otherwise.
     */
    public harvest(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("harvest", {tile}, callback);
    }

    /**
     * Moves this Unit from its current Tile to an adjacent Tile.
     * @param tile The Tile this Unit should move to.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if it moved, false
     * otherwise.
     */
    public move(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("move", {tile}, callback);
    }

    /**
     * Picks up some materials or food on or adjacent to the unit's tile. Does
     * not count as an action.
     * @param tile The Tile to pickup materials/food from.
     * @param resource The type of resource to pickup ('material' or 'food').
     * @param amount The amount of the resource to pickup, numbers <= 0 will
     * pickup all of the resource possible.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully picked up a
     * resource, false otherwise.
     */
    public pickup(tile: ITileState, resource: string, amount: number, callback?:
                  (returned: boolean) => void,
    ): void {
        this.runOnServer("pickup", {tile, resource, amount}, callback);
    }

    /**
     * Regenerates energy. Must be in range of a friendly shelter to rest. Unit
     * cannot move after performing this action.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully rested,
     * false otherwise.
     */
    public rest(callback?: (returned: boolean) => void): void {
        this.runOnServer("rest", {}, callback);
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
