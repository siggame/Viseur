import { EventEmitter } from "events";
import { IDeltaReason } from "./gamelog";

/* tslint:disable:no-empty-interface */

/** The base structure of a state */
export interface IState {}

/* tslint:enable:no-empty-interface */

export class StateObject extends EventEmitter {
    /** The current state (e.g. at delta time = 0) */
    public current?: IState;

    /** The next state (e.g. at delta time = 1) */
    public next?: IState;

    constructor() {
        super();
    }

    /**
     * Update this state object's current and next state, should call prior to
     * rendering
     * @param {Object} current - the current state
     * @param {Object} next - the next state
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    public update(
        current?: IState,
        next?: IState,
        reason?: IDeltaReason,
        nextReason?: IDeltaReason,
    ): void {
        // these are all shorthand args sent so we don't have to lookup via this.current and check if it exists
        this.current = current;
        this.next = next;
    }

    /**
     * Invoked when the state updates. Intended to be overridden by subclass(es)
     * @param {Object} current the current (most) game state, will be this.next if this.current is null
     * @param {Object} next the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason the reason for the current delta
     * @param {DeltaReason} nextReason the reason for the next delta
     */
    public stateUpdated(
        current: IState,
        next: IState,
        reason: IDeltaReason,
        nextReason: IDeltaReason,
    ): void {
        // intended to be overridden by inheriting classes, no need to call this super
    }
}
