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
 * Steal from merchants and become the most infamous pirate.
 *
 */
export interface GameState extends BaseGame {
    /**
     * The rate buried gold increases each turn.
     *
     */
    buryInterestRate: number;

    /**
     * How much gold it costs to construct a single crew.
     *
     */
    crewCost: number;

    /**
     * How much damage crew deal to each other.
     *
     */
    crewDamage: number;

    /**
     * The maximum amount of health a crew member can have.
     *
     */
    crewHealth: number;

    /**
     * The number of moves Units with only crew are given each turn.
     *
     */
    crewMoves: number;

    /**
     * A crew's attack range. Range is circular.
     *
     */
    crewRange: number;

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
     * How much health a Unit recovers when they rest.
     *
     */
    healFactor: number;

    /**
     * The number of Tiles in the map along the y (vertical) axis.
     *
     */
    mapHeight: number;

    /**
     * The number of Tiles in the map along the x (horizontal) axis.
     *
     */
    mapWidth: number;

    /**
     * The maximum number of turns before the game will automatically end.
     *
     */
    maxTurns: number;

    /**
     * How much gold merchant Ports get each turn.
     *
     */
    merchantGoldRate: number;

    /**
     * When a merchant ship spawns, the amount of additional gold it has
     * relative to the Port's investment.
     *
     */
    merchantInterestRate: number;

    /**
     * The Euclidean distance buried gold must be from the Player's Port to
     * accumulate interest.
     *
     */
    minInterestDistance: number;

    /**
     * List of all the players in the game.
     *
     */
    players: PlayerState[];

    /**
     * Every Port in the game. Merchant ports have owner set to null.
     *
     */
    ports: PortState[];

    /**
     * How far a Unit can be from a Port to rest. Range is circular.
     *
     */
    restRange: number;

    /**
     * A unique identifier for the game instance that is being played.
     *
     */
    session: string;

    /**
     * How much gold it costs to construct a ship.
     *
     */
    shipCost: number;

    /**
     * How much damage ships deal to ships and ports.
     *
     */
    shipDamage: number;

    /**
     * The maximum amount of health a ship can have.
     *
     */
    shipHealth: number;

    /**
     * The number of moves Units with ships are given each turn.
     *
     */
    shipMoves: number;

    /**
     * A ship's attack range. Range is circular.
     *
     */
    shipRange: number;

    /**
     * All the tiles in the map, stored in Row-major order. Use `x + y *
     * mapWidth` to access the correct index.
     *
     */
    tiles: TileState[];

    /**
     * The amount of time (in nano-seconds) added after each player performs a
     * turn.
     *
     */
    timeAddedPerTurn: number;

    /**
     * Every Unit in the game. Merchant units have targetPort set to a port.
     *
     */
    units: UnitState[];
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
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     *
     */
    clientType: string;

    /**
     * The amount of gold this Player has in reserve.
     *
     */
    gold: number;

    /**
     * The amount of infamy this Player has.
     *
     */
    infamy: number;

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
     * The Port owned by this Player.
     *
     */
    port: PortState;

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
     * Every Unit owned by this Player.
     *
     */
    units: UnitState[];

    /**
     * If the player won the game or not.
     *
     */
    won: boolean;
}

/**
 * A port on a Tile.
 *
 */
export interface PortState extends GameObjectState {
    /**
     * For players, how much more gold this Port can spend this turn. For
     * merchants, how much gold this Port has accumulated (it will spawn a ship
     * when the Port can afford one).
     *
     */
    gold: number;

    /**
     * (Merchants only) How much gold was invested into this Port. Investment
     * determines the strength and value of the next ship.
     *
     */
    investment: number;

    /**
     * The owner of this Port, or null if owned by merchants.
     *
     */
    owner: PlayerState;

    /**
     * The Tile this Port is on.
     *
     */
    tile: TileState;
}

/**
 * A Tile in the game that makes up the 2D map grid.
 *
 */
export interface TileState extends GameObjectState {
    /**
     * (Visualizer only) Whether this tile is deep sea or grassy. This has no
     * effect on gameplay, but feel free to use it if you want.
     *
     */
    decoration: boolean;

    /**
     * The amount of gold buried on this tile.
     *
     */
    gold: number;

    /**
     * The Port on this Tile if present, otherwise null.
     *
     */
    port: PortState;

    /**
     * The Tile to the 'East' of this one (x+1, y). Null if out of bounds of the
     * map.
     *
     */
    tileEast: TileState;

    /**
     * The Tile to the 'North' of this one (x, y-1). Null if out of bounds of
     * the map.
     *
     */
    tileNorth: TileState;

    /**
     * The Tile to the 'South' of this one (x, y+1). Null if out of bounds of
     * the map.
     *
     */
    tileSouth: TileState;

    /**
     * The Tile to the 'West' of this one (x-1, y). Null if out of bounds of the
     * map.
     *
     */
    tileWest: TileState;

    /**
     * The type of Tile this is ('water' or 'land').
     *
     */
    type: "water" | "land";

    /**
     * The Unit on this Tile if present, otherwise null.
     *
     */
    unit: UnitState;

    /**
     * The x (horizontal) position of this Tile.
     *
     */
    x: number;

    /**
     * The y (vertical) position of this Tile.
     *
     */
    y: number;
}

/**
 * A unit group in the game. This may consist of a ship and any number of crew.
 *
 */
export interface UnitState extends GameObjectState {
    /**
     * Whether this Unit has performed its action this turn.
     *
     */
    acted: boolean;

    /**
     * How many crew are on this Tile. This number will always be <= crewHealth.
     *
     */
    crew: number;

    /**
     * How much total health the crew on this Tile have.
     *
     */
    crewHealth: number;

    /**
     * How much gold this Unit is carrying.
     *
     */
    gold: number;

    /**
     * How many more times this Unit may move this turn.
     *
     */
    moves: number;

    /**
     * The Player that owns and can control this Unit, or null if the Unit is
     * neutral.
     *
     */
    owner: PlayerState;

    /**
     * (Merchants only) The path this Unit will follow. The first element is the
     * Tile this Unit will move to next.
     *
     */
    path: TileState[];

    /**
     * If a ship is on this Tile, how much health it has remaining. 0 for no
     * ship.
     *
     */
    shipHealth: number;

    /**
     * (Merchants only) The number of turns this merchant ship won't be able to
     * move. They will still attack. Merchant ships are stunned when they're
     * attacked.
     *
     */
    stunTurns: number;

    /**
     * (Merchants only) The Port this Unit is moving to.
     *
     */
    targetPort: PortState;

    /**
     * The Tile this Unit is on.
     *
     */
    tile: TileState;
}

// -- Run Deltas -- \\
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
 * The delta about what happened when a 'Port' ran their 'spawn' function.
 *
 */
export type PortSpawnRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<PortState>;

            /** The name of the function of the caller to run. */
            functionName: "spawn";

            /**
             * The arguments to Port.spawn,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * What type of Unit to create ('crew' or 'ship').
                 *
                 */
                type: "crew" | "ship";
            };
        };

        /**
         * True if Unit was created successfully, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Unit' ran their 'attack' function.
 *
 */
export type UnitAttackRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "attack";

            /**
             * The arguments to Unit.attack,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile to attack.
                 *
                 */
                tile: GameObjectInstance<TileState>;
                /**
                 * Whether to attack 'crew' or 'ship'. Crew deal damage to crew
                 * and ships deal damage to ships. Consumes any remaining moves.
                 *
                 */
                target: "crew" | "ship";
            };
        };

        /**
         * True if successfully attacked, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Unit' ran their 'bury' function.
 *
 */
export type UnitBuryRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "bury";

            /**
             * The arguments to Unit.bury,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * How much gold this Unit should bury. Amounts <= 0 will bury
                 * as much as possible.
                 *
                 */
                amount: number;
            };
        };

        /**
         * True if successfully buried, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Unit' ran their 'deposit' function.
 *
 */
export type UnitDepositRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "deposit";

            /**
             * The arguments to Unit.deposit,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The amount of gold to deposit. Amounts <= 0 will deposit all
                 * the gold on this Unit.
                 *
                 */
                amount: number;
            };
        };

        /**
         * True if successfully deposited, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Unit' ran their 'dig' function.
 *
 */
export type UnitDigRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "dig";

            /**
             * The arguments to Unit.dig,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * How much gold this Unit should take. Amounts <= 0 will dig up
                 * as much as possible.
                 *
                 */
                amount: number;
            };
        };

        /**
         * True if successfully dug up, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Unit' ran their 'move' function.
 *
 */
export type UnitMoveRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "move";

            /**
             * The arguments to Unit.move,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile this Unit should move to.
                 *
                 */
                tile: GameObjectInstance<TileState>;
            };
        };

        /**
         * True if it moved, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Unit' ran their 'rest' function.
 *
 */
export type UnitRestRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "rest";

            /**
             * The arguments to Unit.rest,
             * as a map of the argument name to its value.
             */
            args: {};
        };

        /**
         * True if successfully rested, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Unit' ran their 'split' function.
 *
 */
export type UnitSplitRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "split";

            /**
             * The arguments to Unit.split,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile to move the crew to.
                 *
                 */
                tile: GameObjectInstance<TileState>;
                /**
                 * The number of crew to move onto that Tile. Amount <= 0 will
                 * move all the crew to that Tile.
                 *
                 */
                amount: number;
                /**
                 * The amount of gold the crew should take with them. Gold < 0
                 * will move all the gold to that Tile.
                 *
                 */
                gold: number;
            };
        };

        /**
         * True if successfully split, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Unit' ran their 'withdraw' function.
 *
 */
export type UnitWithdrawRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "withdraw";

            /**
             * The arguments to Unit.withdraw,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The amount of gold to withdraw. Amounts <= 0 will withdraw
                 * everything.
                 *
                 */
                amount: number;
            };
        };

        /**
         * True if successfully withdrawn, false otherwise.
         *
         */
        returned: boolean;
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

/** All the possible specific deltas in Pirates. */
export type PiratesSpecificDelta =
    | GameObjectLogRanDelta
    | PortSpawnRanDelta
    | UnitAttackRanDelta
    | UnitBuryRanDelta
    | UnitDepositRanDelta
    | UnitDigRanDelta
    | UnitMoveRanDelta
    | UnitRestRanDelta
    | UnitSplitRanDelta
    | UnitWithdrawRanDelta
    | AIRunTurnFinishedDelta;

/** The possible delta objects in Pirates. */
export type PiratesDelta = GameSpecificDelta<PiratesSpecificDelta>;
