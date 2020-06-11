import {
    Delta,
    BaseGameObject,
    FinishedDelta,
    RanDelta,
} from "@cadre/ts-utils/cadre";
import { StateObject } from "./state-object";

/**
 * The Delta type, with the "Finished" and "Ran"  delta types removed,
 * as games can define more specific types for them.
 */
type DeltaWithoutGenericFinishedAndRan = Exclude<
    Exclude<Delta, RanDelta>,
    FinishedDelta
>;

/**
 * A wrapper to avoid circular import references on GameObject StateObjects in a game.
 */
export type GameObjectInstance<T extends BaseGameObject> = StateObject<T> & {
    /** The id of this game object. */
    readonly id: string;
};

/** The specific delta shapes to expect for a give game's finished and run deltas. */
export type GameSpecificDelta<T extends FinishedDelta | RanDelta> =
    | T
    | DeltaWithoutGenericFinishedAndRan;
