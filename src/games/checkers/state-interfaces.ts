/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-empty-interface */

// These are the interfaces for all the states in this game
import {
    BaseGame,
    BaseGameObject,
    BasePlayer,
    FinishedDelta,
    RanDelta,
} from "@cadre/ts-utils/cadre";
import {
    GameObjectInstance,
    GameSpecificDelta,
} from "src/viseur/game/base-delta";

// -- Game State Interfaces -- \\
/**
 * The simple version of American Checkers. An 8x8 board with 12 checkers on
 * each side that must move diagonally to the opposing side until kinged.
 *
 */
export interface GameState extends BaseGame {
    /**
     * The height of the board for the Y component of a checker.
     *
     */
    boardHeight: number;

    /**
     * The width of the board for X component of a checker.
     *
     */
    boardWidth: number;

    /**
     * The checker that last moved and must be moved because only one checker
     * can move during each players turn.
     *
     */
    checkerMoved: CheckerState;

    /**
     * If the last checker that moved jumped, meaning it can move again.
     *
     */
    checkerMovedJumped: boolean;

    /**
     * All the checkers currently in the game.
     *
     */
    checkers: CheckerState[];

    /**
     * The player whose turn it is currently. That player can send commands.
     * Other players cannot.
     *
     */
    currentPlayer: PlayerState;

    /**
     * The current turn number, starting at 0 for the first player's turn.
     *
     */
    currentTurn: number;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via ID.
     *
     */
    gameObjects: { [id: string]: GameObjectState };

    /**
     * The maximum number of turns before the game will automatically end.
     *
     */
    maxTurns: number;

    /**
     * List of all the players in the game.
     *
     */
    players: PlayerState[];

    /**
     * A unique identifier for the game instance that is being played.
     *
     */
    session: string;

    /**
     * The amount of time (in nano-seconds) added after each player performs a
     * turn.
     *
     */
    timeAddedPerTurn: number;
}

/**
 * A checker on the game board.
 *
 */
export interface CheckerState extends GameObjectState {
    /**
     * If the checker has been kinged and can move backwards.
     *
     */
    kinged: boolean;

    /**
     * The player that controls this Checker.
     *
     */
    owner: PlayerState;

    /**
     * The x coordinate of the checker.
     *
     */
    x: number;

    /**
     * The y coordinate of the checker.
     *
     */
    y: number;
}

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 *
 */
export interface GameObjectState extends BaseGameObject {
    /**
     * String representing the top level Class that this game object is an
     * instance of. Used for reflection to create new instances on clients, but
     * exposed for convenience should AIs want this data.
     *
     */
    gameObjectName: string;

    /**
     * A unique id for each instance of a GameObject or a sub class. Used for
     * client and server communication. Should never change value after being
     * set.
     *
     */
    id: string;

    /**
     * Any strings logged will be stored here. Intended for debugging.
     *
     */
    logs: string[];
}

/**
 * A player in this game. Every AI controls one player.
 *
 */
export interface PlayerState extends GameObjectState, BasePlayer {
    /**
     * All the checkers currently in the game owned by this player.
     *
     */
    checkers: CheckerState[];

    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     *
     */
    clientType: string;

    /**
     * If the player lost the game or not.
     *
     */
    lost: boolean;

    /**
     * The name of the player.
     *
     */
    name: string;

    /**
     * This player's opponent in the game.
     *
     */
    opponent: PlayerState;

    /**
     * The reason why the player lost the game.
     *
     */
    reasonLost: string;

    /**
     * The reason why the player won the game.
     *
     */
    reasonWon: string;

    /**
     * The amount of time (in ns) remaining for this AI to send commands.
     *
     */
    timeRemaining: number;

    /**
     * If the player won the game or not.
     *
     */
    won: boolean;

    /**
     * The direction your checkers must go along the y-axis until kinged.
     *
     */
    yDirection: number;
}

// -- Run Deltas -- \\
/**
 * The delta about what happened when a 'Checker' ran their 'isMine' function.
 *
 */
export type CheckerIsMineRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<CheckerState>;

            /** The name of the function of the caller to run. */
            functionName: "isMine";

            /**
             * The arguments to Checker.isMine,
             * as a map of the argument name to its value.
             */
            args: {};
        };

        /**
         * True if it is yours, false if it is not yours.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Checker' ran their 'move' function.
 *
 */
export type CheckerMoveRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<CheckerState>;

            /** The name of the function of the caller to run. */
            functionName: "move";

            /**
             * The arguments to Checker.move,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The x coordinate to move to.
                 *
                 */
                x: number;
                /**
                 * The y coordinate to move to.
                 *
                 */
                y: number;
            };
        };

        /**
         * Returns the same checker that moved if the move was successful.
         * Otherwise null.
         *
         */
        returned: GameObjectInstance<CheckerState>;
    };
};

/**
 * The delta about what happened when a 'GameObject' ran their 'log' function.
 *
 */
export type GameObjectLogRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<GameObjectState>;

            /** The name of the function of the caller to run. */
            functionName: "log";

            /**
             * The arguments to GameObject.log,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * A string to add to this GameObject's log. Intended for
                 * debugging.
                 *
                 */
                message: string;
            };
        };

        /**
         * This run delta does not return a value.
         *
         */
        returned: void;
    };
};

/**
 * The delta about what happened when a 'AI' ran their 'gotCaptured' function.
 *
 */
export type AIGotCapturedFinishedDelta = FinishedDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        order: {
            /** The name of the function of the caller to run. */
            name: "gotCaptured";

            /**
             * The arguments to AI.gotCaptured,
             * as a positional array of arguments send to the AI.
             */
            args: {
                /**
                 * The checker that was captured.
                 *
                 */
                0: GameObjectInstance<CheckerState>;
            };
        };

        /**
         * This run delta does not return a value.
         *
         */
        returned: void;
    };
};

/**
 * The delta about what happened when a 'AI' ran their 'runTurn' function.
 *
 */
export type AIRunTurnFinishedDelta = FinishedDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        order: {
            /** The name of the function of the caller to run. */
            name: "runTurn";

            /**
             * The arguments to AI.runTurn,
             * as a positional array of arguments send to the AI.
             */
            args: {};
        };

        /**
         * Represents if you want to end your turn. True means end your turn,
         * False means to keep your turn going and re-call this function.
         *
         */
        returned: boolean;
    };
};

/** All the possible specific deltas in Checkers. */
export type CheckersSpecificDelta =
    | CheckerIsMineRanDelta
    | CheckerMoveRanDelta
    | GameObjectLogRanDelta
    | AIGotCapturedFinishedDelta
    | AIRunTurnFinishedDelta;

/** The possible delta objects in Checkers. */
export type CheckersDelta = GameSpecificDelta<CheckersSpecificDelta>;
