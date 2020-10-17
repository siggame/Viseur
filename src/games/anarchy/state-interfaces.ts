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
 * Two player grid based game where each player tries to burn down the other
 * player's buildings. Let it burn.
 *
 */
export interface GameState extends BaseGame {
    /**
     * How many bribes players get at the beginning of their turn, not counting
     * their burned down Buildings.
     *
     */
    baseBribesPerTurn: number;

    /**
     * All the buildings in the game.
     *
     */
    buildings: BuildingState[];

    /**
     * The current Forecast, which will be applied at the end of the turn.
     *
     */
    currentForecast: ForecastState;

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
     * All the forecasts in the game, indexed by turn number.
     *
     */
    forecasts: ForecastState[];

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via ID.
     *
     */
    gameObjects: { [id: string]: GameObjectState };

    /**
     * The width of the entire map along the vertical (y) axis.
     *
     */
    mapHeight: number;

    /**
     * The width of the entire map along the horizontal (x) axis.
     *
     */
    mapWidth: number;

    /**
     * The maximum amount of fire value for any Building.
     *
     */
    maxFire: number;

    /**
     * The maximum amount of intensity value for any Forecast.
     *
     */
    maxForecastIntensity: number;

    /**
     * The maximum number of turns before the game will automatically end.
     *
     */
    maxTurns: number;

    /**
     * The next Forecast, which will be applied at the end of your opponent's
     * turn. This is also the Forecast WeatherStations can control this turn.
     *
     */
    nextForecast: ForecastState;

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
 * A basic building. It does nothing besides burn down. Other Buildings inherit
 * from this class.
 *
 */
export interface BuildingState extends GameObjectState {
    /**
     * When true this building has already been bribed this turn and cannot be
     * bribed again this turn.
     *
     */
    bribed: boolean;

    /**
     * The Building directly to the east of this building, or null if not
     * present.
     *
     */
    buildingEast: BuildingState;

    /**
     * The Building directly to the north of this building, or null if not
     * present.
     *
     */
    buildingNorth: BuildingState;

    /**
     * The Building directly to the south of this building, or null if not
     * present.
     *
     */
    buildingSouth: BuildingState;

    /**
     * The Building directly to the west of this building, or null if not
     * present.
     *
     */
    buildingWest: BuildingState;

    /**
     * How much fire is currently burning the building, and thus how much damage
     * it will take at the end of its owner's turn. 0 means no fire.
     *
     */
    fire: number;

    /**
     * How much health this building currently has. When this reaches 0 the
     * Building has been burned down.
     *
     */
    health: number;

    /**
     * True if this is the Headquarters of the owning player, false otherwise.
     * Burning this down wins the game for the other Player.
     *
     */
    isHeadquarters: boolean;

    /**
     * The player that owns this building. If it burns down (health reaches 0)
     * that player gets an additional bribe(s).
     *
     */
    owner: PlayerState;

    /**
     * The location of the Building along the x-axis.
     *
     */
    x: number;

    /**
     * The location of the Building along the y-axis.
     *
     */
    y: number;
}

/**
 * Can put out fires completely.
 *
 */
export interface FireDepartmentState extends BuildingState {
    /**
     * The amount of fire removed from a building when bribed to extinguish a
     * building.
     *
     */
    fireExtinguished: number;
}

/**
 * The weather effect that will be applied at the end of a turn, which causes
 * fires to spread.
 *
 */
export interface ForecastState extends GameObjectState {
    /**
     * The Player that can use WeatherStations to control this Forecast when its
     * the nextForecast.
     *
     */
    controllingPlayer: PlayerState;

    /**
     * The direction the wind will blow fires in. Can be 'north', 'east',
     * 'south', or 'west'.
     *
     */
    direction: "North" | "East" | "South" | "West";

    /**
     * How much of a Building's fire that can be blown in the direction of this
     * Forecast. Fire is duplicated (copied), not moved (transferred).
     *
     */
    intensity: number;
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
     * How many bribes this player has remaining to use during their turn. Each
     * action a Building does costs 1 bribe. Any unused bribes are lost at the
     * end of the player's turn.
     *
     */
    bribesRemaining: number;

    /**
     * All the buildings owned by this player.
     *
     */
    buildings: BuildingState[];

    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     *
     */
    clientType: string;

    /**
     * All the FireDepartments owned by this player.
     *
     */
    fireDepartments: FireDepartmentState[];

    /**
     * The Warehouse that serves as this player's headquarters and has extra
     * health. If this gets destroyed they lose.
     *
     */
    headquarters: WarehouseState;

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
     * All the PoliceDepartments owned by this player.
     *
     */
    policeDepartments: PoliceDepartmentState[];

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
     * All the warehouses owned by this player. Includes the Headquarters.
     *
     */
    warehouses: WarehouseState[];

    /**
     * All the WeatherStations owned by this player.
     *
     */
    weatherStations: WeatherStationState[];

    /**
     * If the player won the game or not.
     *
     */
    won: boolean;
}

/**
 * Used to keep cities under control and raid Warehouses.
 *
 */
export interface PoliceDepartmentState extends BuildingState {}

/**
 * A typical abandoned warehouse that anarchists hang out in and can be bribed
 * to burn down Buildings.
 *
 */
export interface WarehouseState extends BuildingState {
    /**
     * How exposed the anarchists in this warehouse are to PoliceDepartments.
     * Raises when bribed to ignite buildings, and drops each turn if not
     * bribed.
     *
     */
    exposure: number;

    /**
     * The amount of fire added to buildings when bribed to ignite a building.
     * Headquarters add more fire than normal Warehouses.
     *
     */
    fireAdded: number;
}

/**
 * Can be bribed to change the next Forecast in some way.
 *
 */
export interface WeatherStationState extends BuildingState {}

// -- Run Deltas -- \\
/**
 * The delta about what happened when a 'FireDepartment' ran their 'extinguish'
 * function.
 *
 */
export type FireDepartmentExtinguishRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<FireDepartmentState>;

            /** The name of the function of the caller to run. */
            functionName: "extinguish";

            /**
             * The arguments to FireDepartment.extinguish,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Building you want to extinguish.
                 *
                 */
                building: GameObjectInstance<BuildingState>;
            };
        };

        /**
         * True if the bribe worked, false otherwise.
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
 * The delta about what happened when a 'PoliceDepartment' ran their 'raid'
 * function.
 *
 */
export type PoliceDepartmentRaidRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<PoliceDepartmentState>;

            /** The name of the function of the caller to run. */
            functionName: "raid";

            /**
             * The arguments to PoliceDepartment.raid,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The warehouse you want to raid.
                 *
                 */
                warehouse: GameObjectInstance<WarehouseState>;
            };
        };

        /**
         * The amount of damage dealt to the warehouse, or -1 if there was an
         * error.
         *
         */
        returned: number;
    };
};

/**
 * The delta about what happened when a 'Warehouse' ran their 'ignite' function.
 *
 */
export type WarehouseIgniteRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<WarehouseState>;

            /** The name of the function of the caller to run. */
            functionName: "ignite";

            /**
             * The arguments to Warehouse.ignite,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Building you want to light on fire.
                 *
                 */
                building: GameObjectInstance<BuildingState>;
            };
        };

        /**
         * The exposure added to this Building's exposure. -1 is returned if
         * there was an error.
         *
         */
        returned: number;
    };
};

/**
 * The delta about what happened when a 'WeatherStation' ran their 'intensify'
 * function.
 *
 */
export type WeatherStationIntensifyRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<WeatherStationState>;

            /** The name of the function of the caller to run. */
            functionName: "intensify";

            /**
             * The arguments to WeatherStation.intensify,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * By default the intensity will be increased by 1, setting this
                 * to true decreases the intensity by 1.
                 *
                 */
                negative: boolean;
            };
        };

        /**
         * True if the intensity was changed, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'WeatherStation' ran their 'rotate'
 * function.
 *
 */
export type WeatherStationRotateRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<WeatherStationState>;

            /** The name of the function of the caller to run. */
            functionName: "rotate";

            /**
             * The arguments to WeatherStation.rotate,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * By default the direction will be rotated clockwise. If you
                 * set this to true we will rotate the forecast counterclockwise
                 * instead.
                 *
                 */
                counterclockwise: boolean;
            };
        };

        /**
         * True if the rotation worked, false otherwise.
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

/** All the possible specific deltas in Anarchy. */
export type AnarchySpecificDelta =
    | FireDepartmentExtinguishRanDelta
    | GameObjectLogRanDelta
    | PoliceDepartmentRaidRanDelta
    | WarehouseIgniteRanDelta
    | WeatherStationIntensifyRanDelta
    | WeatherStationRotateRanDelta
    | AIRunTurnFinishedDelta;

/** The possible delta objects in Anarchy. */
export type AnarchyDelta = GameSpecificDelta<AnarchySpecificDelta>;
