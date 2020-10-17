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
 * Combine elements and be the first scientists to create fusion.
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
     * The maximum number of interns a player can have.
     *
     */
    internCap: number;

    /**
     * A list of all jobs. The first element is intern, second is physicists,
     * and third is manager.
     *
     */
    jobs: JobState[];

    /**
     * Every Machine in the game.
     *
     */
    machines: MachineState[];

    /**
     * The maximum number of managers a player can have.
     *
     */
    managerCap: number;

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
     * The number of materials that spawn per spawn cycle.
     *
     */
    materialSpawn: number;

    /**
     * The maximum number of turns before the game will automatically end.
     *
     */
    maxTurns: number;

    /**
     * The maximum number of physicists a player can have.
     *
     */
    physicistCap: number;

    /**
     * List of all the players in the game.
     *
     */
    players: PlayerState[];

    /**
     * The amount of victory points added when a refined ore is consumed by the
     * generator.
     *
     */
    refinedValue: number;

    /**
     * The percent of max HP regained when a unit end their turn on a tile owned
     * by their player.
     *
     */
    regenerateRate: number;

    /**
     * A unique identifier for the game instance that is being played.
     *
     */
    session: string;

    /**
     * The amount of turns it takes a unit to spawn.
     *
     */
    spawnTime: number;

    /**
     * The amount of turns a unit cannot do anything when stunned.
     *
     */
    stunTime: number;

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
     * The number turns a unit is immune to being stunned.
     *
     */
    timeImmune: number;

    /**
     * Every Unit in the game.
     *
     */
    units: UnitState[];

    /**
     * The amount of combined heat and pressure that you need to win.
     *
     */
    victoryAmount: number;
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
 * Information about a unit's job.
 *
 */
export interface JobState extends GameObjectState {
    /**
     * How many combined resources a unit with this Job can hold at once.
     *
     */
    carryLimit: number;

    /**
     * The amount of damage this Job does per attack.
     *
     */
    damage: number;

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
     * The Job title. 'intern', 'manager', or 'physicist'.
     *
     */
    title: "intern" | "manager" | "physicist";
}

/**
 * A machine in the game. Used to refine ore.
 *
 */
export interface MachineState extends GameObjectState {
    /**
     * What type of ore the machine takes it. Also determines the type of
     * material it outputs. (redium or blueium).
     *
     */
    oreType: "redium" | "blueium";

    /**
     * The amount of ore that needs to be inputted into the machine for it to be
     * worked.
     *
     */
    refineInput: number;

    /**
     * The amount of refined ore that is returned after the machine has been
     * fully worked.
     *
     */
    refineOutput: number;

    /**
     * The number of times this machine needs to be worked to refine ore.
     *
     */
    refineTime: number;

    /**
     * The Tile this Machine is on.
     *
     */
    tile: TileState;

    /**
     * Tracks how many times this machine has been worked. (0 to refineTime).
     *
     */
    worked: number;
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
     * Every generator Tile owned by this Player. (listed from the outer edges
     * inward, from top to bottom).
     *
     */
    generatorTiles: TileState[];

    /**
     * The amount of heat this Player has.
     *
     */
    heat: number;

    /**
     * The time left till a intern spawns. (0 to spawnTime).
     *
     */
    internSpawn: number;

    /**
     * If the player lost the game or not.
     *
     */
    lost: boolean;

    /**
     * The time left till a manager spawns. (0 to spawnTime).
     *
     */
    managerSpawn: number;

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
     * The time left till a physicist spawns. (0 to spawnTime).
     *
     */
    physicistSpawn: number;

    /**
     * The amount of pressure this Player has.
     *
     */
    pressure: number;

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
     * All the tiles this Player's units can spawn on. (listed from the outer
     * edges inward, from top to bottom).
     *
     */
    spawnTiles: TileState[];

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
 * A Tile in the game that makes up the 2D map grid.
 *
 */
export interface TileState extends GameObjectState {
    /**
     * The amount of blueium on this tile.
     *
     */
    blueium: number;

    /**
     * The amount of blueium ore on this tile.
     *
     */
    blueiumOre: number;

    /**
     * (Visualizer only) Different tile types, cracked, slightly dirty, etc.
     * This has no effect on gameplay, but feel free to use it if you want.
     *
     */
    decoration: number;

    /**
     * The direction of a conveyor belt ('blank', 'north', 'east', 'south', or
     * 'west'). Blank means conveyor doesn't move.
     *
     */
    direction: "blank" | "north" | "east" | "south" | "west";

    /**
     * Whether or not the tile is a wall.
     *
     */
    isWall: boolean;

    /**
     * The Machine on this Tile if present, otherwise null.
     *
     */
    machine: MachineState;

    /**
     * The owner of this Tile, or null if owned by no-one. Only for generators
     * and spawn areas.
     *
     */
    owner: PlayerState;

    /**
     * The amount of redium on this tile.
     *
     */
    redium: number;

    /**
     * The amount of redium ore on this tile.
     *
     */
    rediumOre: number;

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
     * The type of Tile this is ('normal', 'generator', 'conveyor', or 'spawn').
     *
     */
    type: "normal" | "generator" | "conveyor" | "spawn";

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
 * A unit in the game. May be a manager, intern, or physicist.
 *
 */
export interface UnitState extends GameObjectState {
    /**
     * Whether or not this Unit has performed its action this turn.
     *
     */
    acted: boolean;

    /**
     * The amount of blueium carried by this unit. (0 to job carry capacity -
     * other carried items).
     *
     */
    blueium: number;

    /**
     * The amount of blueium ore carried by this unit. (0 to job carry capacity
     * - other carried items).
     *
     */
    blueiumOre: number;

    /**
     * The remaining health of a unit.
     *
     */
    health: number;

    /**
     * The Job this Unit has.
     *
     */
    job: JobState;

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
     * The amount of redium carried by this unit. (0 to job carry capacity -
     * other carried items).
     *
     */
    redium: number;

    /**
     * The amount of redium ore carried by this unit. (0 to job carry capacity -
     * other carried items).
     *
     */
    rediumOre: number;

    /**
     * Duration of stun immunity. (0 to timeImmune).
     *
     */
    stunImmune: number;

    /**
     * Duration the unit is stunned. (0 to the game constant stunTime).
     *
     */
    stunTime: number;

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
 * The delta about what happened when a 'Unit' ran their 'act' function.
 *
 */
export type UnitActRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "act";

            /**
             * The arguments to Unit.act,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The tile the unit acts on.
                 *
                 */
                tile: GameObjectInstance<TileState>;
            };
        };

        /**
         * True if successfully acted, false otherwise.
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
 * The delta about what happened when a 'Unit' ran their 'drop' function.
 *
 */
export type UnitDropRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "drop";

            /**
             * The arguments to Unit.drop,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The tile the materials will be dropped on.
                 *
                 */
                tile: GameObjectInstance<TileState>;
                /**
                 * The number of materials to dropped. Amounts <= 0 will drop
                 * all the materials.
                 *
                 */
                amount: number;
                /**
                 * The material the unit will drop. 'redium', 'blueium', 'redium
                 * ore', or 'blueium ore'.
                 *
                 */
                material: "redium ore" | "redium" | "blueium" | "blueium ore";
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
 * The delta about what happened when a 'Unit' ran their 'pickup' function.
 *
 */
export type UnitPickupRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "pickup";

            /**
             * The arguments to Unit.pickup,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The tile the materials will be picked up from.
                 *
                 */
                tile: GameObjectInstance<TileState>;
                /**
                 * The amount of materials to pick up. Amounts <= 0 will pick up
                 * all the materials that the unit can.
                 *
                 */
                amount: number;
                /**
                 * The material the unit will pick up. 'redium', 'blueium',
                 * 'redium ore', or 'blueium ore'.
                 *
                 */
                material: "redium ore" | "redium" | "blueium" | "blueium ore";
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

/** All the possible specific deltas in Newtonian. */
export type NewtonianSpecificDelta =
    | GameObjectLogRanDelta
    | UnitActRanDelta
    | UnitAttackRanDelta
    | UnitDropRanDelta
    | UnitMoveRanDelta
    | UnitPickupRanDelta
    | AIRunTurnFinishedDelta;

/** The possible delta objects in Newtonian. */
export type NewtonianDelta = GameSpecificDelta<NewtonianSpecificDelta>;
