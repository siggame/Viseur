import { Delta, IBaseGame, IGamelog } from "cadre-ts-utils/cadre";

/**
 * A simplier shorthand for why a delta occurred,
 * removing delta merge properties.
 */
export type DeltaReason
    = Pick<Delta, "type">
    & Pick<Delta, "data">
;

/**
 * A gamelog that is streaming to us as we are conencted to the game server
 * LIVE.
 */
export interface IViseurGamelog extends IGamelog {
    /** if this gamelog is streaming */
    streaming?: boolean;
}

/** Extends to add a reverse delta to the delta */
export type ReverseDelta = Delta & {
    /** A delta that goes BACKWARDs in state when merged */
    reversed?: IBaseGame;
};

/** A gamelog with reverse deltas */
export interface IGamelogWithReverses extends IViseurGamelog {
    /** List of deltas with their reverses as options */
    deltas: ReverseDelta[];
}
