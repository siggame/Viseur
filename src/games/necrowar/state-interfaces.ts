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
 * Send hordes of the undead at your opponent while defending yourself against
 * theirs to win.
 *
 */
export interface GameState extends BaseGame {
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
     * The amount of gold income per turn per unit in a mine.
     *
     */
    goldIncomePerUnit: number;

    /**
     * The amount of gold income per turn per unit in the island mine.
     *
     */
    islandIncomePerUnit: number;

    /**
     * The Amount of gold income per turn per unit fishing on the river side.
     *
     */
    manaIncomePerUnit: number;

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
     * The amount of turns it takes between the river changing phases.
     *
     */
    riverPhase: number;

    /**
     * A unique identifier for the game instance that is being played.
     *
     */
    session: string;

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
     * A list of every tower type / job.
     *
     */
    towerJobs: TowerJobState[];

    /**
     * Every Tower in the game.
     *
     */
    towers: TowerState[];

    /**
     * A list of every unit type / job.
     *
     */
    unitJobs: UnitJobState[];

    /**
     * Every Unit in the game.
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
     * The amount of gold this Player has.
     *
     */
    gold: number;

    /**
     * The amount of health remaining for this player's main unit.
     *
     */
    health: number;

    /**
     * The tile that the home base is located on.
     *
     */
    homeBase: TileState[];

    /**
     * If the player lost the game or not.
     *
     */
    lost: boolean;

    /**
     * The amount of mana this player has.
     *
     */
    mana: number;

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
     * All tiles that this player can build on and move workers on.
     *
     */
    side: TileState[];

    /**
     * The amount of time (in ns) remaining for this AI to send commands.
     *
     */
    timeRemaining: number;

    /**
     * Every Tower owned by this player.
     *
     */
    towers: TowerState[];

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
 * A Tile in the game that makes up the 2D map grid.
 *
 */
export interface TileState extends GameObjectState {
    /**
     * The amount of corpses on this tile.
     *
     */
    corpses: number;

    /**
     * Whether or not the tile is a castle tile.
     *
     */
    isCastle: boolean;

    /**
     * Whether or not the tile is considered to be a gold mine or not.
     *
     */
    isGoldMine: boolean;

    /**
     * Whether or not the tile is considered grass or not (Workers can walk on
     * grass).
     *
     */
    isGrass: boolean;

    /**
     * Whether or not the tile is considered to be the island gold mine or not.
     *
     */
    isIslandGoldMine: boolean;

    /**
     * Whether or not the tile is considered a path or not (Units can walk on
     * paths).
     *
     */
    isPath: boolean;

    /**
     * Whether or not the tile is considered a river or not.
     *
     */
    isRiver: boolean;

    /**
     * Whether or not the tile is considered a tower or not.
     *
     */
    isTower: boolean;

    /**
     * Whether or not the tile is the unit spawn.
     *
     */
    isUnitSpawn: boolean;

    /**
     * Whether or not the tile can be moved on by workers.
     *
     */
    isWall: boolean;

    /**
     * Whether or not the tile is the worker spawn.
     *
     */
    isWorkerSpawn: boolean;

    /**
     * The amount of Ghouls on this tile.
     *
     */
    numGhouls: number;

    /**
     * The amount of Hounds on this tile.
     *
     */
    numHounds: number;

    /**
     * The amount of Zombies on this tile.
     *
     */
    numZombies: number;

    /**
     * Which player owns this tile, only applies to grass tiles for workers,
     * NULL otherwise.
     *
     */
    owner: PlayerState;

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
     * The Tower on this Tile if present, otherwise null.
     *
     */
    tower: TowerState;

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
 * A tower in the game. Used to combat enemy waves.
 *
 */
export interface TowerState extends GameObjectState {
    /**
     * Whether this tower has attacked this turn or not.
     *
     */
    attacked: boolean;

    /**
     * How many turns are left before it can fire again.
     *
     */
    cooldown: number;

    /**
     * How much remaining health this tower has.
     *
     */
    health: number;

    /**
     * What type of tower this is (it's job).
     *
     */
    job: TowerJobState;

    /**
     * The player that built / owns this tower.
     *
     */
    owner: PlayerState;

    /**
     * The Tile this Tower is on.
     *
     */
    tile: TileState;
}

/**
 * Information about a tower's job/type.
 *
 */
export interface TowerJobState extends GameObjectState {
    /**
     * Whether this tower type hits all of the units on a tile (true) or one at
     * a time (false).
     *
     */
    allUnits: boolean;

    /**
     * The amount of damage this type does per attack.
     *
     */
    damage: number;

    /**
     * How much does this type cost in gold.
     *
     */
    goldCost: number;

    /**
     * The amount of starting health this type has.
     *
     */
    health: number;

    /**
     * How much does this type cost in mana.
     *
     */
    manaCost: number;

    /**
     * The number of tiles this type can attack from.
     *
     */
    range: number;

    /**
     * The type title. 'arrow', 'aoe', 'ballista', 'cleansing', or 'castle'.
     *
     */
    title: "arrow" | "aoe" | "ballista" | "cleansing" | "castle";

    /**
     * How many turns have to take place between this type's attacks.
     *
     */
    turnsBetweenAttacks: number;
}

/**
 * A unit in the game. May be a worker, zombie, ghoul, hound, abomination,
 * wraith or horseman.
 *
 */
export interface UnitState extends GameObjectState {
    /**
     * Whether or not this Unit has performed its action this turn (attack or
     * build).
     *
     */
    acted: boolean;

    /**
     * The remaining health of a unit.
     *
     */
    health: number;

    /**
     * The type of unit this is.
     *
     */
    job: UnitJobState;

    /**
     * The number of moves this unit has left this turn.
     *
     */
    moves: number;

    /**
     * The Player that owns and can control this Unit.
     *
     */
    owner: PlayerState;

    /**
     * The Tile this Unit is on.
     *
     */
    tile: TileState;
}

/**
 * Information about a unit's job/type.
 *
 */
export interface UnitJobState extends GameObjectState {
    /**
     * The amount of damage this type does per attack.
     *
     */
    damage: number;

    /**
     * How much does this type cost in gold.
     *
     */
    goldCost: number;

    /**
     * The amount of starting health this type has.
     *
     */
    health: number;

    /**
     * How much does this type cost in mana.
     *
     */
    manaCost: number;

    /**
     * The number of moves this type can make per turn.
     *
     */
    moves: number;

    /**
     * How many of this type of unit can take up one tile.
     *
     */
    perTile: number;

    /**
     * Amount of tiles away this type has to be in order to be effective.
     *
     */
    range: number;

    /**
     * The type title. 'worker', 'zombie', 'ghoul', 'hound', 'abomination',
     * 'wraith' or 'horseman'.
     *
     */
    title:
        | "worker"
        | "zombie"
        | "ghoul"
        | "hound"
        | "abomination"
        | "wraith"
        | "horseman";
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
 * The delta about what happened when a 'Tile' ran their 'res' function.
 *
 */
export type TileResRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<TileState>;

            /** The name of the function of the caller to run. */
            functionName: "res";

            /**
             * The arguments to Tile.res,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * Number of zombies to resurrect.
                 *
                 */
                num: number;
            };
        };

        /**
         * True if successful res, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Tile' ran their 'spawnUnit' function.
 *
 */
export type TileSpawnUnitRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<TileState>;

            /** The name of the function of the caller to run. */
            functionName: "spawnUnit";

            /**
             * The arguments to Tile.spawnUnit,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The title of the desired unit type.
                 *
                 */
                title: string;
            };
        };

        /**
         * True if successfully spawned, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Tile' ran their 'spawnWorker' function.
 *
 */
export type TileSpawnWorkerRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<TileState>;

            /** The name of the function of the caller to run. */
            functionName: "spawnWorker";

            /**
             * The arguments to Tile.spawnWorker,
             * as a map of the argument name to its value.
             */
            args: {};
        };

        /**
         * True if successfully spawned, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Tower' ran their 'attack' function.
 *
 */
export type TowerAttackRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<TowerState>;

            /** The name of the function of the caller to run. */
            functionName: "attack";

            /**
             * The arguments to Tower.attack,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile to attack.
                 *
                 */
                tile: GameObjectInstance<TileState>;
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
 * The delta about what happened when a 'Unit' ran their 'build' function.
 *
 */
export type UnitBuildRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "build";

            /**
             * The arguments to Unit.build,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The tower type to build, as a string.
                 *
                 */
                title: string;
            };
        };

        /**
         * True if successfully built, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Unit' ran their 'fish' function.
 *
 */
export type UnitFishRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "fish";

            /**
             * The arguments to Unit.fish,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The tile the unit will stand on as it fishes.
                 *
                 */
                tile: GameObjectInstance<TileState>;
            };
        };

        /**
         * True if successfully began fishing for mana, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Unit' ran their 'mine' function.
 *
 */
export type UnitMineRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "mine";

            /**
             * The arguments to Unit.mine,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The tile the mine is located on.
                 *
                 */
                tile: GameObjectInstance<TileState>;
            };
        };

        /**
         * True if successfully entered mine and began mining, false otherwise.
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

/** All the possible specific deltas in Necrowar. */
export type NecrowarSpecificDelta =
    | GameObjectLogRanDelta
    | TileResRanDelta
    | TileSpawnUnitRanDelta
    | TileSpawnWorkerRanDelta
    | TowerAttackRanDelta
    | UnitAttackRanDelta
    | UnitBuildRanDelta
    | UnitFishRanDelta
    | UnitMineRanDelta
    | UnitMoveRanDelta
    | AIRunTurnFinishedDelta;

/** The possible delta objects in Necrowar. */
export type NecrowarDelta = GameSpecificDelta<NecrowarSpecificDelta>;
