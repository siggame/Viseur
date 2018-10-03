import { Immutable } from "cadre-ts-utils";
import { IDeltaReason } from "./interfaces";

/* tslint:disable:no-empty-interface */

/** The base structure of a state */
export interface IState {}

/* tslint:enable:no-empty-interface */

/**
 * An object in the game that has states that tween [0, 1)].
 */
export class StateObject {
    /** The current state (e.g. at delta time = 0) */
    public current: IState | undefined;

    /** The next state (e.g. at delta time = 1) */
    public next: IState | undefined;

    /**
     * Update this state object's current and next state, should call prior to
     * rendering.
     *
     * @param current - The current state.
     * @param next - The next state.
     * @param reason - The reason for the current delta.
     * @param nextReason - The reason for the next delta.
     */
    public update(
        current?: IState,
        next?: IState,
        reason?: IDeltaReason,
        nextReason?: IDeltaReason,
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
        if (!this.current || !this.next) {
            throw new Error("No game state to get!");
        }

        return (this.current || this.next) as Immutable<NonNullable<this["current"]>>;
    }

    /**
     * Gets the current most state, e.g. this.next || this.current;
     *
     * @returns The state most next, current if there is no next.
     */
    public getNextMostState(): Immutable<NonNullable<this["current"]>> {
        if (!this.current || !this.next) {
            throw new Error("No game state to get!");
        }

        return (this.next || this.current) as Immutable<NonNullable<this["current"]>>;
    }

    /**
     * Invoked when the state updates.
     * Intended to be overridden by subclass(es).
     *
     * @param current - The current (most) game state, will be this.next if
     * this.current is null.
     * @param next - The next (most) game state, will be this.current if
     * this.next is null.
     * @param reason - The reason for the current delta.
     * @param nextReason - The reason for the next delta.
     */
    protected stateUpdated(
        current: IState,
        next: IState,
        reason: IDeltaReason,
        nextReason: IDeltaReason,
    ): void {
        // Intended to be overridden by inheriting classes,
        // no need to call this super.
    }
}
