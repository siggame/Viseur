// `any` is used throughout delta merging because of how dynamic it is.
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Delta, BaseGame, DeltaMergeConstants } from "@cadre/ts-utils/cadre";
import { isObject, objectHasProperty, UnknownObject } from "src/utils";

/**
 * Parses delta updates, and creates reverse deltas for gamelogs/cadre
 * communications.
 */
export class Parser {
    /**
     * The constants we require to parse deltas from the game server/gamelog.
     */
    private constants: DeltaMergeConstants = {
        DELTA_LIST_LENGTH: "",
        DELTA_REMOVED: "",
    };

    /**
     * Creates a parser for game deltas.
     *
     * @param constants - The constants used to delta merge states.
     */
    constructor(constants?: DeltaMergeConstants) {
        if (constants) {
            this.constants = constants;
        }
    }

    /**
     * Updates the constants one they are sent/parsed to us.
     *
     * @param constants - The new set of constants to use.
     */
    public updateConstants(constants: DeltaMergeConstants): void {
        this.constants = constants;
    }

    /**
     * Creates a "reverse" delta, which is change in state information to get
     * FROM a state to a PREVIOUS state.
     *
     * @param state - A fully merged delta state, WITHOUT the delta merged
     * onto it.
     * @param delta - The delta that would be applied to the state to
     * transform it.
     * @param reverse - The reverse delta to merge into. Do not directly pass
     * this from first invocation.
     * @returns The reverse delta. Apply this to a nextState that has had the
     * delta applies to it to get back to the original state.
     */
    public createReverseDelta(
        state: UnknownObject = {},
        delta: Delta["game"] = {},
        reverse: Delta["game"] = {},
    ): BaseGame {
        for (const key of Object.keys(delta)) {
            const deltaValue = delta && delta[key];
            const stateValue = state && state[key];

            if (key === this.constants.DELTA_LIST_LENGTH) {
                reverse[this.constants.DELTA_LIST_LENGTH] = state.length;
                continue;
            }

            if (
                !objectHasProperty(state, key) ||
                stateValue === undefined ||
                stateValue === null
            ) {
                reverse[key] = this.constants.DELTA_REMOVED;
                continue;
            }

            if (isObject(deltaValue)) {
                reverse[key] = reverse[key] || {};

                this.createReverseDelta(
                    state[key] as UnknownObject,
                    deltaValue,
                    reverse[key] as UnknownObject,
                );
            } else {
                reverse[key] = stateValue;
            }
        }

        return reverse as BaseGame;
    }

    /**
     * Merges delta information from a `delta` onto a `state`.
     *
     * @param state - The state to merge `delta` onto.
     * @param delta - The delta formatted information of how to update `state`.
     * @returns The state, now delta merged.
     */
    public mergeDelta(state: BaseGame, delta: Delta["game"]): BaseGame {
        state.gameObjects = state.gameObjects || {};

        if (delta.gameObjects) {
            for (const id of Object.keys(delta.gameObjects)) {
                if (!state.gameObjects[id]) {
                    state.gameObjects[id] = {
                        id,
                        logs: [],
                        gameObjectName: "",
                    };
                }
            }
        }

        return this.recursiveMergeDelta(state, delta, state.gameObjects);
    }

    /**
     * Merges delta information from a `delta` onto a `state`, while connecting game object references.
     *
     * @param state - The state to merge `delta` onto.
     * @param delta - The delta formatted information of how to update `state`.
     * @param gameObjects - The game objects within `state`, for forming cycles.
     * @returns The state, now delta merged.
     */
    private recursiveMergeDelta(
        state: any,
        delta: any,
        gameObjects?: BaseGame["gameObjects"],
    ): any {
        const deltaLength: number | undefined =
            delta[this.constants.DELTA_LIST_LENGTH];

        if (deltaLength !== undefined) {
            // then this part in the state is an array
            // pop elements off the array until the array is short enough.
            // An increase in array size will be added below as arrays resize
            //  when keys larger are set
            while (state.length > deltaLength) {
                state.pop();
            }
        }

        for (const key of Object.keys(delta)) {
            const d = delta[key];
            const dIsObject = isObject(d);

            if (key === this.constants.DELTA_LIST_LENGTH) {
                // we already used this key above, skip it now
                continue;
            } else if (d === this.constants.DELTA_REMOVED) {
                delete state[key];
            } else if (
                gameObjects &&
                dIsObject &&
                objectHasProperty(d, "id") &&
                state !== gameObjects
            ) {
                // then it is a game object reference, so connect it
                state[key] = gameObjects[d.id];
            } else if (dIsObject && isObject(state[key])) {
                this.recursiveMergeDelta(state[key], d, gameObjects);
            } else {
                if (dIsObject) {
                    // if the delta has a list length, make an array,
                    //  otherwise an object
                    const newState =
                        d[this.constants.DELTA_LIST_LENGTH] === undefined
                            ? {}
                            : [];
                    state[key] = this.recursiveMergeDelta(
                        newState,
                        d,
                        gameObjects,
                    );
                } else {
                    state[key] = d;
                }
            }
        }

        return state;
    }
}
