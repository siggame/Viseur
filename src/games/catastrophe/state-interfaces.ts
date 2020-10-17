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
 * Convert as many humans to as you can to survive in this post-apocalyptic
 * wasteland.
 *
 */
export interface GameState extends BaseGame {
    /**
     * The multiplier for the amount of energy regenerated when resting in a
     * shelter with the cat overlord.
     *
     */
    catEnergyMult: number;

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
     * The amount of turns it takes for a Tile that was just harvested to grow
     * food again.
     *
     */
    harvestCooldown: number;

    /**
     * All the Jobs that Units can have in the game.
     *
     */
    jobs: JobState[];

    /**
     * The amount that the harvest rate is lowered each season.
     *
     */
    lowerHarvestAmount: number;

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
     * The multiplier for the cost of actions when performing them in range of a
     * monument. Does not effect pickup cost.
     *
     */
    monumentCostMult: number;

    /**
     * The number of materials in a monument.
     *
     */
    monumentMaterials: number;

    /**
     * The number of materials in a neutral Structure.
     *
     */
    neutralMaterials: number;

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
     * The number of materials in a shelter.
     *
     */
    shelterMaterials: number;

    /**
     * The amount of food Players start with.
     *
     */
    startingFood: number;

    /**
     * The multiplier for the amount of energy regenerated when resting while
     * starving.
     *
     */
    starvingEnergyMult: number;

    /**
     * Every Structure in the game.
     *
     */
    structures: StructureState[];

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
     * After a food tile is harvested, the number of turns before it can be
     * harvested again.
     *
     */
    turnsBetweenHarvests: number;

    /**
     * The number of turns between fresh humans being spawned on the road.
     *
     */
    turnsToCreateHuman: number;

    /**
     * The number of turns before the harvest rate is lowered (length of each
     * season basically).
     *
     */
    turnsToLowerHarvest: number;

    /**
     * Every Unit in the game.
     *
     */
    units: UnitState[];

    /**
     * The number of materials in a wall.
     *
     */
    wallMaterials: number;
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
 * Information about a Unit's job.
 *
 */
export interface JobState extends GameObjectState {
    /**
     * The amount of energy this Job normally uses to perform its actions.
     *
     */
    actionCost: number;

    /**
     * How many combined resources a Unit with this Job can hold at once.
     *
     */
    carryLimit: number;

    /**
     * The number of moves this Job can make per turn.
     *
     */
    moves: number;

    /**
     * The amount of energy normally regenerated when resting at a shelter.
     *
     */
    regenRate: number;

    /**
     * The Job title.
     *
     */
    title:
        | "fresh human"
        | "cat overlord"
        | "soldier"
        | "gatherer"
        | "builder"
        | "missionary";

    /**
     * The amount of food per turn this Unit consumes. If there isn't enough
     * food for every Unit, all Units become starved and do not consume food.
     *
     */
    upkeep: number;
}

/**
 * A player in this game. Every AI controls one player.
 *
 */
export interface PlayerState extends GameObjectState, BasePlayer {
    /**
     * The overlord cat Unit owned by this Player.
     *
     */
    cat: UnitState;

    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     *
     */
    clientType: string;

    /**
     * The amount of food owned by this player.
     *
     */
    food: number;

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
     * Every Structure owned by this Player.
     *
     */
    structures: StructureState[];

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
     * The total upkeep of every Unit owned by this Player. If there isn't
     * enough food for every Unit, all Units become starved and do not consume
     * food.
     *
     */
    upkeep: number;

    /**
     * If the player won the game or not.
     *
     */
    won: boolean;
}

/**
 * A structure on a Tile.
 *
 */
export interface StructureState extends GameObjectState {
    /**
     * The range of this Structure's effect. For example, a radius of 1 means
     * this Structure affects a 3x3 square centered on this Structure.
     *
     */
    effectRadius: number;

    /**
     * The number of materials in this Structure. Once this number reaches 0,
     * this Structure is destroyed.
     *
     */
    materials: number;

    /**
     * The owner of this Structure if any, otherwise null.
     *
     */
    owner: PlayerState;

    /**
     * The Tile this Structure is on.
     *
     */
    tile: TileState;

    /**
     * The type of Structure this is ('shelter', 'monument', 'wall', 'road',
     * 'neutral').
     *
     */
    type: "neutral" | "shelter" | "monument" | "wall" | "road";
}

/**
 * A Tile in the game that makes up the 2D map grid.
 *
 */
export interface TileState extends GameObjectState {
    /**
     * The number of food dropped on this Tile.
     *
     */
    food: number;

    /**
     * The amount of food that can be harvested from this Tile per turn.
     *
     */
    harvestRate: number;

    /**
     * The number of materials dropped on this Tile.
     *
     */
    materials: number;

    /**
     * The Structure on this Tile if present, otherwise null.
     *
     */
    structure: StructureState;

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
     * The amount of turns before this resource can be harvested.
     *
     */
    turnsToHarvest: number;

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
 * A unit in the game.
 *
 */
export interface UnitState extends GameObjectState {
    /**
     * Whether this Unit has performed its action this turn.
     *
     */
    acted: boolean;

    /**
     * The amount of energy this Unit has (from 0.0 to 100.0).
     *
     */
    energy: number;

    /**
     * The amount of food this Unit is holding.
     *
     */
    food: number;

    /**
     * The Job this Unit was recruited to do.
     *
     */
    job: JobState;

    /**
     * The amount of materials this Unit is holding.
     *
     */
    materials: number;

    /**
     * The tile this Unit is moving to. This only applies to neutral fresh
     * humans spawned on the road. Otherwise, the tile this Unit is on.
     *
     */
    movementTarget: TileState;

    /**
     * How many moves this Unit has left this turn.
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
     * The Units in the same squad as this Unit. Units in the same squad attack
     * and defend together.
     *
     */
    squad: UnitState[];

    /**
     * Whether this Unit is starving. Starving Units regenerate energy at half
     * the rate they normally would while resting.
     *
     */
    starving: boolean;

    /**
     * The Tile this Unit is on.
     *
     */
    tile: TileState;

    /**
     * The number of turns before this Unit dies. This only applies to neutral
     * fresh humans created from combat. Otherwise, 0.
     *
     */
    turnsToDie: number;
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
 * The delta about what happened when a 'Unit' ran their 'changeJob' function.
 *
 */
export type UnitChangeJobRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "changeJob";

            /**
             * The arguments to Unit.changeJob,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The name of the Job to change to.
                 *
                 */
                job: "soldier" | "gatherer" | "builder" | "missionary";
            };
        };

        /**
         * True if successfully changed Jobs, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Unit' ran their 'construct' function.
 *
 */
export type UnitConstructRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "construct";

            /**
             * The arguments to Unit.construct,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile to construct the Structure on. It must have enough
                 * materials on it for a Structure to be constructed.
                 *
                 */
                tile: GameObjectInstance<TileState>;
                /**
                 * The type of Structure to construct on that Tile.
                 *
                 */
                type: "neutral" | "shelter" | "monument" | "wall" | "road";
            };
        };

        /**
         * True if successfully constructed a structure, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Unit' ran their 'convert' function.
 *
 */
export type UnitConvertRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "convert";

            /**
             * The arguments to Unit.convert,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile with the Unit to convert.
                 *
                 */
                tile: GameObjectInstance<TileState>;
            };
        };

        /**
         * True if successfully converted, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Unit' ran their 'deconstruct' function.
 *
 */
export type UnitDeconstructRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "deconstruct";

            /**
             * The arguments to Unit.deconstruct,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile to deconstruct. It must have a Structure on it.
                 *
                 */
                tile: GameObjectInstance<TileState>;
            };
        };

        /**
         * True if successfully deconstructed, false otherwise.
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
                 * The Tile to drop materials/food on.
                 *
                 */
                tile: GameObjectInstance<TileState>;
                /**
                 * The type of resource to drop ('materials' or 'food').
                 *
                 */
                resource: "materials" | "food";
                /**
                 * The amount of the resource to drop. Amounts <= 0 will drop as
                 * much as possible.
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
 * The delta about what happened when a 'Unit' ran their 'harvest' function.
 *
 */
export type UnitHarvestRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "harvest";

            /**
             * The arguments to Unit.harvest,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile you want to harvest.
                 *
                 */
                tile: GameObjectInstance<TileState>;
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
                 * The Tile to pickup materials/food from.
                 *
                 */
                tile: GameObjectInstance<TileState>;
                /**
                 * The type of resource to pickup ('materials' or 'food').
                 *
                 */
                resource: "materials" | "food";
                /**
                 * The amount of the resource to pickup. Amounts <= 0 will
                 * pickup as much as possible.
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

/** All the possible specific deltas in Catastrophe. */
export type CatastropheSpecificDelta =
    | GameObjectLogRanDelta
    | UnitAttackRanDelta
    | UnitChangeJobRanDelta
    | UnitConstructRanDelta
    | UnitConvertRanDelta
    | UnitDeconstructRanDelta
    | UnitDropRanDelta
    | UnitHarvestRanDelta
    | UnitMoveRanDelta
    | UnitPickupRanDelta
    | UnitRestRanDelta
    | AIRunTurnFinishedDelta;

/** The possible delta objects in Catastrophe. */
export type CatastropheDelta = GameSpecificDelta<CatastropheSpecificDelta>;
