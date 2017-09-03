import { IBaseGameState, IGameObjectReference } from "./interfaces";

/** A shorthand object representing a player that won or lost in the game */
export interface IGamelogWinnerLoser {
    /** The player's index in the game.players array */
    index: number;

    /** The player's GameObject id */
    id: string;

    /** The name of the player */
    name: string;

    /** The reason this player won or lost */
    reason: string;

    /** Indicates if they disconnected unexpectedly before the game was over */
    disconnected: boolean;

    /** Indicates if they timed out before the game was over */
    timedOut: boolean;
}

/** Lookup of constants used to parse game server <-> client IO */
export interface IGameServerConstants {
    /**
     * Symbolizes that the key with this value has been deleted from the
     * owning object (e.g. object key or array index)
     */
    DELTA_REMOVED: string;

    /**
     * A string that is a special key found in array like objects to
     * indicate that they are actually an array. the value of those object's
     * keys (keyed by this value) will be their list (array's) length.
     */
    DELTA_LIST_LENGTH: string;
}

/** The reason why a delta occurred, including data about that event */
export interface IDeltaReason {
    /** reason name, e.g. `start`, `ran`, `finished`, or `disconnect` */
    type: string;

    /** present when the player requests something be `ran` or they `disconnect` */
    player?: IGameObjectReference;

    /** data about the event */
    data?: any;

    /** Present when `ran`. */
    run: {
        /** The game object invoking this run */
        caller: IGameObjectReference;

        /** the string name of the member function of the caller to run server-side */
        functionName: string;

        /** arguments sent from the client to the run function. Will be key/value based on argument names */
        args: {
            [key: string]: any;
        };
    };

    /** present when the type is `ran`, and will be the return value from that `ran` */
    returned: any;

    /**
     * true when `disconnect` if the disconnect was forced due to timeout, false otherwise
     * (the client disconnected gracefully, probably due to exception being thrown on their end)
     */
    timeout: boolean;
}

/** A delta represents a change in game state */
export interface IDelta {
    /** The type of delta, or reason it occurred */
    type: string;

    /**
     * Meta data about why the delta occurred, such as data sent to the server
     * from a game client
     */
    data: IDeltaReason;

    /** The state of the game, but ONLY changed keys */
    game: IBaseGameState;
}

export interface IGamelog {
    /**
     * The name of the game.
     * Use this to figure out how to parse game structure
     */
    gameName: string;

    /**
     * The session identifier used on the game server for this game's session
     */
    gameSession: string;

    /** The Unix epoch for the time when this gamelog was generated */
    epoch: number;

    /** The value used to seed the random number generator server side */
    randomSeed: string;

    /** The list of all players that won this game (normally just one) */
    winners: IGamelogWinnerLoser[];

    /** The list of all players that lost this game (normally just one) */
    losers: IGamelogWinnerLoser[];

    /** Lookup of constants used to parse game server <-> client IO */
    constants: IGameServerConstants;

    /**
     * The list of all deltas in the game. The first delta being the initial
     * state
     */
    deltas: IDelta[];

    /**
     * Not actually present in normal gamelogs
     * True when the gamelog is steaming to us via an in progress game, false/undefined otherwise
     */
    streaming?: boolean;
}
