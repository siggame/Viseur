import { Immutable } from "cadre-ts-utils";
import { Delta } from "cadre-ts-utils/cadre";

/* tslint:disable:no-empty-interface */

/** The base structure of a state */
export interface IState {}

/* tslint:enable:no-empty-interface */

/**
 * An object in the game that has states that tween [0, 1)].
 */
export class StateObject {
    /** The current state (e.g. at delta time = 0) */
    public current: Immutable<IState> | undefined;

    /** The next state (e.g. at delta time = 1) */
    public next: Immutable<IState> | undefined;

    /**
     * Update this state object's current and next state, should call prior to rendering.
     *
     * @param current - The current state.
     * @param next - The next state.
     */
    public update(
        current?: Immutable<IState>,
        next?: Immutable<IState>,
    ): void {
        this.current = current;
        this.next = next;
    }

    /**
     * Gets the current most state, e.g. this.current || this.next;
     *
     * @returns The state most current, next if there is no current.
     */
    public getCurrentMostState(): Immutable<NonNullable<this["current"]>> {
        const state = this.current || this.next;
        if (!state) {
            throw new Error("No game state to get!");
        }

        return state as Immutable<NonNullable<this["current"]>>;
    }

    /**
     * Gets the current most state, e.g. this.next || this.current;
     *
     * @returns The state most next, current if there is no next.
     */
    public getNextMostState(): Immutable<NonNullable<this["current"]>> {
        const state = this.next || this.current;
        if (!state) {
            throw new Error("No game state to get!");
        }

        return state as Immutable<NonNullable<this["current"]>>;
    }

    /**
     * Invoked when the state updates.
     * Intended to be overridden by subclass(es).
     *
     * @param current - The current (most) game state, will be this.next if this.current is null.
     * @param next - The next (most) game state, will be this.current if this.next is null.
     * @param delta - The reason for the current delta.
     * @param nextDelta - The reason for the next delta.
     */
    protected stateUpdated(
        current: Immutable<IState>,
        next: Immutable<IState>,
        delta: Immutable<Delta>,
        nextDelta: Immutable<Delta>,
    ): void {
        // Intended to be overridden by inheriting classes,
        // no need to call this super.
    }
}
