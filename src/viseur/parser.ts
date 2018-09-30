import * as utils from "src/utils";
import { IGameServerConstants } from "./game/gamelog";
import { IBaseGameState, IGameObjects } from "./game/interfaces";
import { UnknownObject } from "src/utils";

/** parses delta updates, and creates reverse deltas for gamelogs/cadre communications */
export class Parser {
    /** The constants we require to parse deltas from the game server/gamelog */
    private constants: IGameServerConstants = {
        DELTA_LIST_LENGTH: "",
        DELTA_REMOVED: "",
    };

    /**
     * Creates a parser for game deltas.
     *
     * @param constants - The constants used to delta merge states.
     */
    constructor(constants?: IGameServerConstants) {
        if (constants) {
            this.constants = constants;
        }
    }

    /**
     * Updates the constants one they are sent/parsed to us.
     *
     * @param constants - The new set of constants to use.
     */
    public updateConstants(constants: IGameServerConstants): void {
        this.constants = constants;
    }

    /**
     * Creates a "reverse" delta, which is change in state information to get FROM a state to a PREVIOUS state.
     * @param state - a fully merged delta state, WITHOUT the delta merged onto it.
     * @param delta - the delta that would be applied to the state to transform it.
     * @param [reverse] - the reverse delta to merge into. Do not directly pass this from first invocation.
     * @returns the reverse delta. Apply this to a nextState that has
     *                   had the delta applies to it to get back to the original state.
     */
    public createReverseDelta(
        state: UnknownObject,
        delta: UnknownObject,
        reverse?: UnknownObject,
    ): IBaseGameState {
        state = state || {};
        reverse = reverse || {};

        for (const key of Object.keys(delta)) {
            const deltaValue = delta[key];
            const stateValue = state[key];

            if (key === this.constants.DELTA_LIST_LENGTH) {
                reverse[this.constants.DELTA_LIST_LENGTH] = state.length;
                continue;
            }

            if (!state.hasOwnProperty(key) || stateValue === undefined) {
                reverse[key] = this.constants.DELTA_REMOVED;
                continue;
            }

            if (utils.isObject(deltaValue)) {
                reverse[key] = reverse[key] || {};

                this.createReverseDelta(
                    state[key] as UnknownObject,
                    deltaValue,
                    reverse[key] as UnknownObject,
                );
            }
            else {
                reverse[key] = stateValue;
            }
        }

        return reverse as IBaseGameState;
    }

    /**
     * merges delta information from a `delta` onto a `state`
     * @param state - the state to merge `delta` onto
     * @param delta - the delta formatted information of how to update `state`
     * @returns state, now delta merged
     */
    public mergeDelta(state: IBaseGameState, delta: IBaseGameState): IBaseGameState {
        if (!state.gameObjects) { // merge the initial state, then it we can hook up game object references after
            this.recursiveMergeDelta(state, delta);
        }

        return this.recursiveMergeDelta(state, delta, state.gameObjects);
    }

    /**
     * merges delta information from a `delta` onto a `state`, while connecting game object references
     *
     * @param state - the state to merge `delta` onto
     * @param delta - the delta formatted information of how to update `state`
     * @param [gameObjects] - the game objects within `state`, for forming cycles
     * @returns state, now delta merged
     */
    private recursiveMergeDelta(state: any, delta: any, gameObjects?: IGameObjects): any {
        const deltaLength: number | undefined = delta[this.constants.DELTA_LIST_LENGTH];

        if (deltaLength !== undefined) { // then this part in the state is an array
            // pop elements off the array until the array is short enough.
            // An increase in array size will be added below as arrays resize
            //  when keys larger are set
            while (state.length > deltaLength) {
                state.pop();
            }
        }

        for (const key of Object.keys(delta)) {
            const d = delta[key];
            const dIsObject = utils.isObject(d);

            if (key === this.constants.DELTA_LIST_LENGTH) {
                // we already used this key above, skip it now
                continue;
            }
            else if (d === this.constants.DELTA_REMOVED) {
                delete state[key];
            }
            else if (gameObjects && dIsObject && d.hasOwnProperty("id") && state !== gameObjects) {
                // then it is a game object reference, so connect it
                state[key] = gameObjects[d.id];
            }
            else if (dIsObject && utils.isObject(state[key])) {
                this.recursiveMergeDelta(state[key], d, gameObjects);
            }
            else {
                if (dIsObject) {
                    // if the delta has a list length, make an array,
                    //  otherwise an object
                    const newState = d[this.constants.DELTA_LIST_LENGTH] === undefined
                        ? {}
                        : [];
                    state[key] = this.recursiveMergeDelta(newState, d, gameObjects);
                }
                else {
                    state[key] = d;
                }
            }
        }

        return state;
    }
}
