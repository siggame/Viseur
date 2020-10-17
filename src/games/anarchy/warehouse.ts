// This is a class to represent the Warehouse object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { Building } from "./building";
import {
    AnarchyDelta,
    BuildingState,
    WarehouseState,
} from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
// Set this variable to `true`, if this class should render.
const SHOULD_RENDER = undefined;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Warehouse extends makeRenderable(Building, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Warehouse (dt = 0). */
    public current: WarehouseState | undefined;

    /** The next state of the Warehouse (dt = 1). */
    public next: WarehouseState | undefined;

    // <<-- Creer-Merge: variables -->>
    /**
     * The color of the beam shot out, super buildings override.
     *
     * @returns An RGB number to make the color from. Use hex format for ease.
     */
    protected get beamColorName(): number {
        return 0xff8c00;
    }
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Warehouse with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Warehouse.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: WarehouseState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        // initialization logic goes here
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Warehouse
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
        current: Immutable<WarehouseState>,
        next: Immutable<WarehouseState>,
        delta: Immutable<AnarchyDelta>,
        nextDelta: Immutable<AnarchyDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        // render where the Warehouse is
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Warehouse's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Warehouse instance should not be rendered,
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
        current: Immutable<WarehouseState>,
        next: Immutable<WarehouseState>,
        delta: Immutable<AnarchyDelta>,
        nextDelta: Immutable<AnarchyDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Warehouse based on its current and next states
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
     * Bribes the Warehouse to light a Building on fire. This adds this
     * building's fireAdded to their fire, and then this building's exposure is
     * increased based on the Manhattan distance between the two buildings.
     *
     * @param building - The Building you want to light on fire.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is The exposure added to this
     * Building's exposure. -1 is returned if there was an error.
     */
    public ignite(
        building: BuildingState,
        callback: (returned: number) => void,
    ): void {
        this.runOnServer("ignite", { building }, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
