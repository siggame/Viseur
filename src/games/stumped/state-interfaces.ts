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
 * Gather branches and build up your lodge as beavers fight to survive.
 *
 */
export interface GameState extends BaseGame {
    /**
     * Every Beaver in the game.
     *
     */
    beavers: BeaverState[];

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
     * When a Player has less Beavers than this number, then recruiting other
     * Beavers is free.
     *
     */
    freeBeaversCount: number;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via ID.
     *
     */
    gameObjects: { [id: string]: GameObjectState };

    /**
     * All the Jobs that Beavers can have in the game.
     *
     */
    jobs: JobState[];

    /**
     * Constant number used to calculate what it costs to spawn a new lodge.
     *
     */
    lodgeCostConstant: number;

    /**
     * How many lodges must be owned by a Player at once to win the game.
     *
     */
    lodgesToWin: number;

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
     * Every Spawner in the game.
     *
     */
    spawner: SpawnerState[];

    /**
     * Constant number used to calculate how many branches/food Beavers harvest
     * from Spawners.
     *
     */
    spawnerHarvestConstant: number;

    /**
     * All the types of Spawners in the game.
     *
     */
    spawnerTypes: string[];

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
}

/**
 * A beaver in the game.
 *
 */
export interface BeaverState extends GameObjectState {
    /**
     * The number of actions remaining for the Beaver this turn.
     *
     */
    actions: number;

    /**
     * The amount of branches this Beaver is holding.
     *
     */
    branches: number;

    /**
     * The amount of food this Beaver is holding.
     *
     */
    food: number;

    /**
     * How much health this Beaver has left.
     *
     */
    health: number;

    /**
     * The Job this Beaver was recruited to do.
     *
     */
    job: JobState;

    /**
     * How many moves this Beaver has left this turn.
     *
     */
    moves: number;

    /**
     * The Player that owns and can control this Beaver.
     *
     */
    owner: PlayerState;

    /**
     * True if the Beaver has finished being recruited and can do things, False
     * otherwise.
     *
     */
    recruited: boolean;

    /**
     * The Tile this Beaver is on.
     *
     */
    tile: TileState;

    /**
     * Number of turns this Beaver is distracted for (0 means not distracted).
     *
     */
    turnsDistracted: number;
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
 * Information about a beaver's job.
 *
 */
export interface JobState extends GameObjectState {
    /**
     * The number of actions this Job can make per turn.
     *
     */
    actions: number;

    /**
     * How many combined resources a beaver with this Job can hold at once.
     *
     */
    carryLimit: number;

    /**
     * Scalar for how many branches this Job harvests at once.
     *
     */
    chopping: number;

    /**
     * How much food this Job costs to recruit.
     *
     */
    cost: number;

    /**
     * The amount of damage this Job does per attack.
     *
     */
    damage: number;

    /**
     * How many turns a beaver attacked by this Job is distracted by.
     *
     */
    distractionPower: number;

    /**
     * The amount of starting health this Job has.
     *
     */
    health: number;

    /**
     * The number of moves this Job can make per turn.
     *
     */
    moves: number;

    /**
     * Scalar for how much food this Job harvests at once.
     *
     */
    munching: number;

    /**
     * The Job title.
     *
     */
    title: string;
}

/**
 * A player in this game. Every AI controls one player.
 *
 */
export interface PlayerState extends GameObjectState, BasePlayer {
    /**
     * The list of Beavers owned by this Player.
     *
     */
    beavers: BeaverState[];

    /**
     * How many branches are required to build a lodge for this Player.
     *
     */
    branchesToBuildLodge: number;

    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     *
     */
    clientType: string;

    /**
     * A list of Tiles that contain lodges owned by this player.
     *
     */
    lodges: TileState[];

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
}

/**
 * A resource spawner that generates branches or food.
 *
 */
export interface SpawnerState extends GameObjectState {
    /**
     * True if this Spawner has been harvested this turn, and it will not heal
     * at the end of the turn, false otherwise.
     *
     */
    hasBeenHarvested: boolean;

    /**
     * How much health this Spawner has, which is used to calculate how much of
     * its resource can be harvested.
     *
     */
    health: number;

    /**
     * The Tile this Spawner is on.
     *
     */
    tile: TileState;

    /**
     * What type of resource this is ('food' or 'branches').
     *
     */
    type: "food" | "branches";
}

/**
 * A Tile in the game that makes up the 2D map grid.
 *
 */
export interface TileState extends GameObjectState {
    /**
     * The Beaver on this Tile if present, otherwise null.
     *
     */
    beaver: BeaverState;

    /**
     * The number of branches dropped on this Tile.
     *
     */
    branches: number;

    /**
     * The cardinal direction water is flowing on this Tile ('North', 'East',
     * 'South', 'West').
     *
     */
    flowDirection: "North" | "East" | "South" | "West" | "";

    /**
     * The number of food dropped on this Tile.
     *
     */
    food: number;

    /**
     * The owner of the Beaver lodge on this Tile, if present, otherwise null.
     *
     */
    lodgeOwner: PlayerState;

    /**
     * The resource Spawner on this Tile if present, otherwise null.
     *
     */
    spawner: SpawnerState;

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
     * What type of Tile this is, either 'water' or 'land'.
     *
     */
    type: "land" | "water";

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

// -- Run Deltas -- \\
/**
 * The delta about what happened when a 'Beaver' ran their 'attack' function.
 *
 */
export type BeaverAttackRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<BeaverState>;

            /** The name of the function of the caller to run. */
            functionName: "attack";

            /**
             * The arguments to Beaver.attack,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Beaver to attack. Must be on an adjacent Tile.
                 *
                 */
                beaver: GameObjectInstance<BeaverState>;
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
 * The delta about what happened when a 'Beaver' ran their 'buildLodge'
 * function.
 *
 */
export type BeaverBuildLodgeRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<BeaverState>;

            /** The name of the function of the caller to run. */
            functionName: "buildLodge";

            /**
             * The arguments to Beaver.buildLodge,
             * as a map of the argument name to its value.
             */
            args: {};
        };

        /**
         * True if successfully built a lodge, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Beaver' ran their 'drop' function.
 *
 */
export type BeaverDropRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<BeaverState>;

            /** The name of the function of the caller to run. */
            functionName: "drop";

            /**
             * The arguments to Beaver.drop,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile to drop branches/food on. Must be the same Tile that
                 * the Beaver is on, or an adjacent one.
                 *
                 */
                tile: GameObjectInstance<TileState>;
                /**
                 * The type of resource to drop ('branches' or 'food').
                 *
                 */
                resource: "branches" | "food";
                /**
                 * The amount of the resource to drop, numbers <= 0 will drop
                 * all the resource type.
                 *
                 */
                amount: number;
            };
        };

        /**
         * True if successfully dropped the resource, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Beaver' ran their 'harvest' function.
 *
 */
export type BeaverHarvestRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<BeaverState>;

            /** The name of the function of the caller to run. */
            functionName: "harvest";

            /**
             * The arguments to Beaver.harvest,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Spawner you want to harvest. Must be on an adjacent Tile.
                 *
                 */
                spawner: GameObjectInstance<SpawnerState>;
            };
        };

        /**
         * True if successfully harvested, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Beaver' ran their 'move' function.
 *
 */
export type BeaverMoveRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<BeaverState>;

            /** The name of the function of the caller to run. */
            functionName: "move";

            /**
             * The arguments to Beaver.move,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile this Beaver should move to.
                 *
                 */
                tile: GameObjectInstance<TileState>;
            };
        };

        /**
         * True if the move worked, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Beaver' ran their 'pickup' function.
 *
 */
export type BeaverPickupRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<BeaverState>;

            /** The name of the function of the caller to run. */
            functionName: "pickup";

            /**
             * The arguments to Beaver.pickup,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile to pickup branches/food from. Must be the same Tile
                 * that the Beaver is on, or an adjacent one.
                 *
                 */
                tile: GameObjectInstance<TileState>;
                /**
                 * The type of resource to pickup ('branches' or 'food').
                 *
                 */
                resource: "branches" | "food";
                /**
                 * The amount of the resource to drop, numbers <= 0 will pickup
                 * all of the resource type.
                 *
                 */
                amount: number;
            };
        };

        /**
         * True if successfully picked up a resource, false otherwise.
         *
         */
        returned: boolean;
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
 * The delta about what happened when a 'Job' ran their 'recruit' function.
 *
 */
export type JobRecruitRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<JobState>;

            /** The name of the function of the caller to run. */
            functionName: "recruit";

            /**
             * The arguments to Job.recruit,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile that is a lodge owned by you that you wish to spawn
                 * the Beaver of this Job on.
                 *
                 */
                tile: GameObjectInstance<TileState>;
            };
        };

        /**
         * The recruited Beaver if successful, null otherwise.
         *
         */
        returned: GameObjectInstance<BeaverState>;
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

/** All the possible specific deltas in Stumped. */
export type StumpedSpecificDelta =
    | BeaverAttackRanDelta
    | BeaverBuildLodgeRanDelta
    | BeaverDropRanDelta
    | BeaverHarvestRanDelta
    | BeaverMoveRanDelta
    | BeaverPickupRanDelta
    | GameObjectLogRanDelta
    | JobRecruitRanDelta
    | AIRunTurnFinishedDelta;

/** The possible delta objects in Stumped. */
export type StumpedDelta = GameSpecificDelta<StumpedSpecificDelta>;
