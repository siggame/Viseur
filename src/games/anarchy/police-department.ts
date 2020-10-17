// This is a class to represent the PoliceDepartment object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { Building } from "./building";
import {
    AnarchyDelta,
    PoliceDepartmentState,
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
export class PoliceDepartment extends makeRenderable(Building, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the PoliceDepartment (dt = 0). */
    public current: PoliceDepartmentState | undefined;

    /** The next state of the PoliceDepartment (dt = 1). */
    public next: PoliceDepartmentState | undefined;

    // <<-- Creer-Merge: variables -->>
    /** The beam color name to use for beams. */
    protected get beamColorName(): number {
        return 0x222222;
    }
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the PoliceDepartment with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this PoliceDepartment.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: PoliceDepartmentState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        // initialization logic goes here
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render PoliceDepartment
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
        current: Immutable<PoliceDepartmentState>,
        next: Immutable<PoliceDepartmentState>,
        delta: Immutable<AnarchyDelta>,
        nextDelta: Immutable<AnarchyDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        // render where the PoliceDepartment is
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this PoliceDepartment's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this PoliceDepartment instance should not be rendered,
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
        current: Immutable<PoliceDepartmentState>,
        next: Immutable<PoliceDepartmentState>,
        delta: Immutable<AnarchyDelta>,
        nextDelta: Immutable<AnarchyDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the PoliceDepartment based on its current and next states
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
     * Bribe the police to raid a Warehouse, dealing damage equal based on the
     * Warehouse's current exposure, and then resetting it to 0.
     *
     * @param warehouse - The warehouse you want to raid.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is The amount of damage dealt to
     * the warehouse, or -1 if there was an error.
     */
    public raid(
        warehouse: WarehouseState,
        callback: (returned: number) => void,
    ): void {
        this.runOnServer("raid", { warehouse }, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
