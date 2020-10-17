import { Immutable } from "@cadre/ts-utils";
import { Delta } from "@cadre/ts-utils/cadre";

/** The base structure of a state. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface State {}

/**
 * An object in the game that has states that tween [0, 1)].
 */
export class StateObject<TState extends State = State> {
    /** The current state (e.g. At delta time = 0). */
    public current: Immutable<TState> | undefined;

    /** The next state (e.g. TState delta time = 1). */
    public next: Immutable<State> | undefined;

    /**
     * Update this state object's current and next state, should call prior to rendering.
     *
     * @param current - The current state.
     * @param next - The next state.
     */
    public update(
        current?: Immutable<TState>,
        next?: Immutable<TState>,
    ): void {
        this.current = current;
        this.next = next;
    }

    /**
     * Gets the current most state, e.g. This.current || this.next;.
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
     * Gets the current most state, e.g. This.next || this.current;.
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
        /* eslint-disable @typescript-eslint/no-unused-vars */
        current: Immutable<TState>,
        next: Immutable<TState>,
        delta: Immutable<Delta>,
        nextDelta: Immutable<Delta>,
        /* eslint-enable @typescript-eslint/no-unused-vars */
    ): void {
        // Intended to be overridden by inheriting classes,
        // no need to call this super.
    }
}
