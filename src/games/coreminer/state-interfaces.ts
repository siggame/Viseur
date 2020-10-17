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
 * Mine resources to obtain more value than your opponent.
 *
 */
export interface GameState extends BaseGame {
    /**
     * The monetary price of a bomb when bought or sold.
     *
     */
    bombPrice: number;

    /**
     * The amount of cargo space taken up by a Bomb.
     *
     */
    bombSize: number;

    /**
     * Every Bomb in the game.
     *
     */
    bombs: BombState[];

    /**
     * The monetary price of building materials when bought.
     *
     */
    buildingMaterialPrice: number;

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
     * The monetary price of dirt when bought or sold.
     *
     */
    dirtPrice: number;

    /**
     * The amount of damage taken per Tile fallen.
     *
     */
    fallDamage: number;

    /**
     * The amount of extra damage taken for falling while carrying a large
     * amount of cargo.
     *
     */
    fallWeightDamage: number;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via ID.
     *
     */
    gameObjects: { [id: string]: GameObjectState };

    /**
     * The amount of building material required to build a ladder.
     *
     */
    ladderCost: number;

    /**
     * The amount of mining power needed to remove a ladder from a Tile.
     *
     */
    ladderHealth: number;

    /**
     * The amount deemed as a large amount of cargo.
     *
     */
    largeCargoSize: number;

    /**
     * The amount deemed as a large amount of material.
     *
     */
    largeMaterialSize: number;

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
     * The maximum amount of shielding possible on a Tile.
     *
     */
    maxShielding: number;

    /**
     * The maximum number of turns before the game will automatically end.
     *
     */
    maxTurns: number;

    /**
     * The highest upgrade level allowed on a Miner.
     *
     */
    maxUpgradeLevel: number;

    /**
     * Every Miner in the game.
     *
     */
    miners: MinerState[];

    /**
     * The amount of money awarded when ore is dumped in the base and sold.
     *
     */
    orePrice: number;

    /**
     * The amount of value awarded when ore is dumped in the base and sold.
     *
     */
    oreValue: number;

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
     * The amount of building material required to shield a Tile.
     *
     */
    shieldCost: number;

    /**
     * The amount of mining power needed to remove one unit of shielding off a
     * Tile.
     *
     */
    shieldHealth: number;

    /**
     * The monetary price of spawning a Miner.
     *
     */
    spawnPrice: number;

    /**
     * The amount of damage taken when suffocating inside a filled Tile.
     *
     */
    suffocationDamage: number;

    /**
     * The amount of extra damage taken for suffocating under a large amount of
     * material.
     *
     */
    suffocationWeightDamage: number;

    /**
     * The amount of building material required to build a support.
     *
     */
    supportCost: number;

    /**
     * The amount of mining power needed to remove a support from a Tile.
     *
     */
    supportHealth: number;

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
     * The cost to upgrade a Miner.
     *
     */
    upgradePrice: number;

    /**
     * Every Upgrade for a Miner in the game.
     *
     */
    upgrades: UpgradeState[];

    /**
     * The amount of victory points (value) required to win.
     *
     */
    victoryAmount: number;
}

/**
 * A Bomb in the game.
 *
 */
export interface BombState extends GameObjectState {
    /**
     * The Tile this Miner is on.
     *
     */
    tile: TileState;

    /**
     * The number of turns before this Bomb explodes. Zero means it will explode
     * after the current turn.
     *
     */
    timer: number;
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
 * A Miner in the game.
 *
 */
export interface MinerState extends GameObjectState {
    /**
     * The number of bombs being carried by this Miner.
     *
     */
    bombs: number;

    /**
     * The number of building materials carried by this Miner.
     *
     */
    buildingMaterials: number;

    /**
     * The Upgrade this Miner is on.
     *
     */
    currentUpgrade: UpgradeState;

    /**
     * The amount of dirt carried by this Miner.
     *
     */
    dirt: number;

    /**
     * The remaining health of this Miner.
     *
     */
    health: number;

    /**
     * The remaining mining power this Miner has this turn.
     *
     */
    miningPower: number;

    /**
     * The number of moves this Miner has left this turn.
     *
     */
    moves: number;

    /**
     * The amount of ore carried by this Miner.
     *
     */
    ore: number;

    /**
     * The Player that owns and can control this Miner.
     *
     */
    owner: PlayerState;

    /**
     * The Tile this Miner is on.
     *
     */
    tile: TileState;

    /**
     * The upgrade level of this Miner. Starts at 0.
     *
     */
    upgradeLevel: number;
}

/**
 * A player in this game. Every AI controls one player.
 *
 */
export interface PlayerState extends GameObjectState, BasePlayer {
    /**
     * The Tile this Player's base is on.
     *
     */
    baseTile: TileState;

    /**
     * Every Bomb owned by this Player.
     *
     */
    bombs: BombState[];

    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     *
     */
    clientType: string;

    /**
     * The Tiles this Player's hoppers are on.
     *
     */
    hopperTiles: TileState[];

    /**
     * If the player lost the game or not.
     *
     */
    lost: boolean;

    /**
     * Every Miner owned by this Player.
     *
     */
    miners: MinerState[];

    /**
     * The amount of money this Player currently has.
     *
     */
    money: number;

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
     * The amount of value (victory points) this Player has gained.
     *
     */
    value: number;

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
     * An array of Bombs on this Tile.
     *
     */
    bombs: BombState[];

    /**
     * The amount of dirt on this Tile.
     *
     */
    dirt: number;

    /**
     * Whether or not the Tile is a base Tile.
     *
     */
    isBase: boolean;

    /**
     * Whether or not this Tile is about to fall after this turn.
     *
     */
    isFalling: boolean;

    /**
     * Whether or not a hopper is on this Tile.
     *
     */
    isHopper: boolean;

    /**
     * Whether or not a ladder is built on this Tile.
     *
     */
    isLadder: boolean;

    /**
     * Whether or not a support is built on this Tile.
     *
     */
    isSupport: boolean;

    /**
     * An array of the Miners on this Tile.
     *
     */
    miners: MinerState[];

    /**
     * The amount of ore on this Tile.
     *
     */
    ore: number;

    /**
     * The owner of this Tile, or undefined if owned by no-one.
     *
     */
    owner: PlayerState;

    /**
     * The amount of shielding on this Tile.
     *
     */
    shielding: number;

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
 * Information about a Miner's Upgrade module.
 *
 */
export interface UpgradeState extends GameObjectState {
    /**
     * The amount of cargo capacity this Upgrade has.
     *
     */
    cargoCapacity: number;

    /**
     * The maximum amount of health this Upgrade has.
     *
     */
    health: number;

    /**
     * The amount of mining power this Upgrade has per turn.
     *
     */
    miningPower: number;

    /**
     * The number of moves this Upgrade can make per turn.
     *
     */
    moves: number;

    /**
     * The Upgrade title.
     *
     */
    title: string;
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
 * The delta about what happened when a 'Miner' ran their 'build' function.
 *
 */
export type MinerBuildRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<MinerState>;

            /** The name of the function of the caller to run. */
            functionName: "build";

            /**
             * The arguments to Miner.build,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile to build on.
                 *
                 */
                tile: GameObjectInstance<TileState>;
                /**
                 * The structure to build (support, ladder, or shield).
                 *
                 */
                type: "support" | "ladder" | "shield";
            };
        };

        /**
         * True if successfully built, False otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Miner' ran their 'buy' function.
 *
 */
export type MinerBuyRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<MinerState>;

            /** The name of the function of the caller to run. */
            functionName: "buy";

            /**
             * The arguments to Miner.buy,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The type of resource to buy.
                 *
                 */
                resource: "dirt" | "ore" | "bomb" | "buildingMaterials";
                /**
                 * The amount of resource to buy. Amounts <= 0 will buy all of
                 * that material Player can.
                 *
                 */
                amount: number;
            };
        };

        /**
         * True if successfully purchased, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Miner' ran their 'dump' function.
 *
 */
export type MinerDumpRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<MinerState>;

            /** The name of the function of the caller to run. */
            functionName: "dump";

            /**
             * The arguments to Miner.dump,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile the materials will be dumped on.
                 *
                 */
                tile: GameObjectInstance<TileState>;
                /**
                 * The material the Miner will drop. 'dirt', 'ore', or 'bomb'.
                 *
                 */
                material: "dirt" | "ore" | "bomb";
                /**
                 * The number of materials to drop. Amounts <= 0 will drop all
                 * of the material.
                 *
                 */
                amount: number;
            };
        };

        /**
         * True if successfully dumped materials, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Miner' ran their 'mine' function.
 *
 */
export type MinerMineRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<MinerState>;

            /** The name of the function of the caller to run. */
            functionName: "mine";

            /**
             * The arguments to Miner.mine,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile the materials will be mined from.
                 *
                 */
                tile: GameObjectInstance<TileState>;
                /**
                 * The amount of material to mine up. Amounts <= 0 will mine all
                 * the materials that the Miner can.
                 *
                 */
                amount: number;
            };
        };

        /**
         * True if successfully mined, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Miner' ran their 'move' function.
 *
 */
export type MinerMoveRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<MinerState>;

            /** The name of the function of the caller to run. */
            functionName: "move";

            /**
             * The arguments to Miner.move,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile this Miner should move to.
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
 * The delta about what happened when a 'Miner' ran their 'transfer' function.
 *
 */
export type MinerTransferRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<MinerState>;

            /** The name of the function of the caller to run. */
            functionName: "transfer";

            /**
             * The arguments to Miner.transfer,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Miner to transfer materials to.
                 *
                 */
                miner: GameObjectInstance<MinerState>;
                /**
                 * The type of resource to transfer.
                 *
                 */
                resource: "dirt" | "ore" | "bomb" | "buildingMaterials";
                /**
                 * The amount of resource to transfer. Amounts <= 0 will
                 * transfer all the of the material.
                 *
                 */
                amount: number;
            };
        };

        /**
         * True if successfully transferred, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Miner' ran their 'upgrade' function.
 *
 */
export type MinerUpgradeRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<MinerState>;

            /** The name of the function of the caller to run. */
            functionName: "upgrade";

            /**
             * The arguments to Miner.upgrade,
             * as a map of the argument name to its value.
             */
            args: {};
        };

        /**
         * True if successfully upgraded, False otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Player' ran their 'spawnMiner'
 * function.
 *
 */
export type PlayerSpawnMinerRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<PlayerState>;

            /** The name of the function of the caller to run. */
            functionName: "spawnMiner";

            /**
             * The arguments to Player.spawnMiner,
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

/** All the possible specific deltas in Coreminer. */
export type CoreminerSpecificDelta =
    | GameObjectLogRanDelta
    | MinerBuildRanDelta
    | MinerBuyRanDelta
    | MinerDumpRanDelta
    | MinerMineRanDelta
    | MinerMoveRanDelta
    | MinerTransferRanDelta
    | MinerUpgradeRanDelta
    | PlayerSpawnMinerRanDelta
    | AIRunTurnFinishedDelta;

/** The possible delta objects in Coreminer. */
export type CoreminerDelta = GameSpecificDelta<CoreminerSpecificDelta>;
