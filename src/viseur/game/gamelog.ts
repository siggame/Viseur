import { Delta, BaseGame, Gamelog } from "@cadre/ts-utils/cadre";

/**
 * A gamelog that is streaming to us as we are conencted to the game server
 * LIVE.
 */
export interface ViseurGamelog extends Gamelog {
    /** If this gamelog is streaming. */
    streaming?: boolean;
}

/** Extends to add a reverse delta to the delta. */
export type ReverseDelta = Delta & {
    /** A delta that goes BACKWARDs in state when merged. */
    reversed?: BaseGame;
};

/** A gamelog with reverse deltas. */
export interface GamelogWithReverses extends ViseurGamelog {
    /** List of deltas with their reverses as options. */
    deltas: ReverseDelta[];
}
