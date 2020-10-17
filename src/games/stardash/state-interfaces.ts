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
 * Collect of the most of the rarest mineral orbiting around the sun and out-
 * compete your competitor.
 *
 */
export interface GameState extends BaseGame {
    /**
     * All the celestial bodies in the game. The first two are planets and the
     * third is the sun. The fourth is the VP asteroid. Everything else is
     * normal asteroids.
     *
     */
    bodies: BodyState[];

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
     * The cost of dashing.
     *
     */
    dashCost: number;

    /**
     * The distance traveled each turn by dashing.
     *
     */
    dashDistance: number;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via ID.
     *
     */
    gameObjects: { [id: string]: GameObjectState };

    /**
     * The value of every unit of genarium.
     *
     */
    genariumValue: number;

    /**
     * A list of all jobs. The first element is corvette, second is missileboat,
     * third is martyr, fourth is transport, and fifth is miner.
     *
     */
    jobs: JobState[];

    /**
     * The value of every unit of legendarium.
     *
     */
    legendariumValue: number;

    /**
     * The highest amount of material, that can be in a asteroid.
     *
     */
    maxAsteroid: number;

    /**
     * The maximum number of turns before the game will automatically end.
     *
     */
    maxTurns: number;

    /**
     * The smallest amount of material, that can be in a asteroid.
     *
     */
    minAsteroid: number;

    /**
     * The rate at which miners grab minerals from asteroids.
     *
     */
    miningSpeed: number;

    /**
     * The amount of mythicite that spawns at the start of the game.
     *
     */
    mythiciteAmount: number;

    /**
     * The number of orbit updates you cannot mine the mithicite asteroid.
     *
     */
    orbitsProtected: number;

    /**
     * The rarity modifier of the most common ore. This controls how much
     * spawns.
     *
     */
    oreRarityGenarium: number;

    /**
     * The rarity modifier of the rarest ore. This controls how much spawns.
     *
     */
    oreRarityLegendarium: number;

    /**
     * The rarity modifier of the second rarest ore. This controls how much
     * spawns.
     *
     */
    oreRarityRarium: number;

    /**
     * The amount of energy a planet can hold at once.
     *
     */
    planetEnergyCap: number;

    /**
     * The amount of energy the planets restore each round.
     *
     */
    planetRechargeRate: number;

    /**
     * List of all the players in the game.
     *
     */
    players: PlayerState[];

    /**
     * The standard size of ships.
     *
     */
    projectileRadius: number;

    /**
     * The amount of distance missiles travel through space.
     *
     */
    projectileSpeed: number;

    /**
     * Every projectile in the game.
     *
     */
    projectiles: ProjectileState[];

    /**
     * The value of every unit of rarium.
     *
     */
    rariumValue: number;

    /**
     * The regeneration rate of asteroids.
     *
     */
    regenerateRate: number;

    /**
     * A unique identifier for the game instance that is being played.
     *
     */
    session: string;

    /**
     * The standard size of ships.
     *
     */
    shipRadius: number;

    /**
     * The size of the map in the X direction.
     *
     */
    sizeX: number;

    /**
     * The size of the map in the Y direction.
     *
     */
    sizeY: number;

    /**
     * The amount of time (in nano-seconds) added after each player performs a
     * turn.
     *
     */
    timeAddedPerTurn: number;

    /**
     * The number of turns it takes for a asteroid to orbit the sun. (Asteroids
     * move after each players turn).
     *
     */
    turnsToOrbit: number;

    /**
     * Every Unit in the game.
     *
     */
    units: UnitState[];
}

/**
 * A celestial body located within the game.
 *
 */
export interface BodyState extends GameObjectState {
    /**
     * The amount of material the object has, or energy if it is a planet.
     *
     */
    amount: number;

    /**
     * The type of celestial body it is. Either 'planet', 'asteroid', or 'sun'.
     *
     */
    bodyType: "planet" | "asteroid" | "sun";

    /**
     * The type of material the celestial body has. Either 'none', 'genarium',
     * 'rarium', 'legendarium', or 'mythicite'.
     *
     */
    materialType: "none" | "genarium" | "rarium" | "legendarium" | "mythicite";

    /**
     * The Player that owns and can control this Body.
     *
     */
    owner: PlayerState;

    /**
     * The radius of the circle that this body takes up.
     *
     */
    radius: number;

    /**
     * The x value this celestial body is on.
     *
     */
    x: number;

    /**
     * The y value this celestial body is on.
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
    energy: number;

    /**
     * The distance this job can move per turn.
     *
     */
    moves: number;

    /**
     * The distance at which this job can effect things.
     *
     */
    range: number;

    /**
     * The reserve the martyr use to protect allies.
     *
     */
    shield: number;

    /**
     * The Job title. 'corvette', 'missileboat', 'martyr', 'transport', or
     * 'miner'. (in this order from 0-4).
     *
     */
    title: "corvette" | "missileboat" | "martyr" | "transport" | "miner";

    /**
     * How much money it costs to spawn a unit.
     *
     */
    unitCost: number;
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
     * The home base of the player.
     *
     */
    homeBase: BodyState;

    /**
     * If the player lost the game or not.
     *
     */
    lost: boolean;

    /**
     * The amount of money this Player has.
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
     * Every Projectile owned by this Player. The earlier in the list the older
     * they are.
     *
     */
    projectiles: ProjectileState[];

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
     * Every Unit owned by this Player. The earlier in the list the older they
     * are.
     *
     */
    units: UnitState[];

    /**
     * The number of victory points the player has.
     *
     */
    victoryPoints: number;

    /**
     * If the player won the game or not.
     *
     */
    won: boolean;
}

/**
 * Tracks any projectiles moving through space.
 *
 */
export interface ProjectileState extends GameObjectState {
    /**
     * The remaining health of the projectile.
     *
     */
    energy: number;

    /**
     * The amount of remaining distance the projectile can move.
     *
     */
    fuel: number;

    /**
     * The Player that owns and can control this Projectile.
     *
     */
    owner: PlayerState;

    /**
     * The unit that is being attacked by this projectile.
     *
     */
    target: UnitState;

    /**
     * The x value this projectile is on.
     *
     */
    x: number;

    /**
     * The y value this projectile is on.
     *
     */
    y: number;
}

/**
 * A unit in the game. May be a corvette, missleboat, martyr, transport, miner.
 *
 */
export interface UnitState extends GameObjectState {
    /**
     * Whether or not this Unit has performed its action this turn.
     *
     */
    acted: boolean;

    /**
     * The x value this unit is dashing to.
     *
     */
    dashX: number;

    /**
     * The y value this unit is dashing to.
     *
     */
    dashY: number;

    /**
     * The remaining health of the unit.
     *
     */
    energy: number;

    /**
     * The amount of Genarium ore carried by this unit. (0 to job carry capacity
     * - other carried items).
     *
     */
    genarium: number;

    /**
     * Tracks whether or not the ship is dashing or Mining. If true, it cannot
     * do anything else.
     *
     */
    isBusy: boolean;

    /**
     * The Job this Unit has.
     *
     */
    job: JobState;

    /**
     * The amount of Legendarium ore carried by this unit. (0 to job carry
     * capacity - other carried items).
     *
     */
    legendarium: number;

    /**
     * The distance this unit can still move.
     *
     */
    moves: number;

    /**
     * The amount of Mythicite carried by this unit. (0 to job carry capacity -
     * other carried items).
     *
     */
    mythicite: number;

    /**
     * The Player that owns and can control this Unit.
     *
     */
    owner: PlayerState;

    /**
     * The martyr ship that is currently shielding this ship if any.
     *
     */
    protector: UnitState;

    /**
     * The amount of Rarium carried by this unit. (0 to job carry capacity -
     * other carried items).
     *
     */
    rarium: number;

    /**
     * The shield that a martyr ship has.
     *
     */
    shield: number;

    /**
     * The x value this unit is on.
     *
     */
    x: number;

    /**
     * The y value this unit is on.
     *
     */
    y: number;
}

// -- Run Deltas -- \\
/**
 * The delta about what happened when a 'Body' ran their 'nextX' function.
 *
 */
export type BodyNextXRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<BodyState>;

            /** The name of the function of the caller to run. */
            functionName: "nextX";

            /**
             * The arguments to Body.nextX,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The number of turns in the future you wish to check.
                 *
                 */
                num: number;
            };
        };

        /**
         * The x position of the body the input number of turns in the future.
         *
         */
        returned: number;
    };
};

/**
 * The delta about what happened when a 'Body' ran their 'nextY' function.
 *
 */
export type BodyNextYRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<BodyState>;

            /** The name of the function of the caller to run. */
            functionName: "nextY";

            /**
             * The arguments to Body.nextY,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The number of turns in the future you wish to check.
                 *
                 */
                num: number;
            };
        };

        /**
         * The x position of the body the input number of turns in the future.
         *
         */
        returned: number;
    };
};

/**
 * The delta about what happened when a 'Body' ran their 'spawn' function.
 *
 */
export type BodySpawnRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<BodyState>;

            /** The name of the function of the caller to run. */
            functionName: "spawn";

            /**
             * The arguments to Body.spawn,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The x value of the spawned unit.
                 *
                 */
                x: number;
                /**
                 * The y value of the spawned unit.
                 *
                 */
                y: number;
                /**
                 * The job title of the unit being spawned.
                 *
                 */
                title: string;
            };
        };

        /**
         * True if successfully taken, false otherwise.
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
                 * The Unit being attacked.
                 *
                 */
                enemy: GameObjectInstance<UnitState>;
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
 * The delta about what happened when a 'Unit' ran their 'dash' function.
 *
 */
export type UnitDashRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "dash";

            /**
             * The arguments to Unit.dash,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The x value of the destination's coordinates.
                 *
                 */
                x: number;
                /**
                 * The y value of the destination's coordinates.
                 *
                 */
                y: number;
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
                 * The object to be mined.
                 *
                 */
                body: GameObjectInstance<BodyState>;
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
                 * The x value of the destination's coordinates.
                 *
                 */
                x: number;
                /**
                 * The y value of the destination's coordinates.
                 *
                 */
                y: number;
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
 * The delta about what happened when a 'Unit' ran their 'safe' function.
 *
 */
export type UnitSafeRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "safe";

            /**
             * The arguments to Unit.safe,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The x position of the location you wish to arrive.
                 *
                 */
                x: number;
                /**
                 * The y position of the location you wish to arrive.
                 *
                 */
                y: number;
            };
        };

        /**
         * True if pathable by this unit, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Unit' ran their 'shootdown' function.
 *
 */
export type UnitShootdownRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "shootdown";

            /**
             * The arguments to Unit.shootdown,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The projectile being shot down.
                 *
                 */
                missile: GameObjectInstance<ProjectileState>;
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
 * The delta about what happened when a 'Unit' ran their 'transfer' function.
 *
 */
export type UnitTransferRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<UnitState>;

            /** The name of the function of the caller to run. */
            functionName: "transfer";

            /**
             * The arguments to Unit.transfer,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The unit you are grabbing the resources from.
                 *
                 */
                unit: GameObjectInstance<UnitState>;
                /**
                 * The amount of materials to you with to grab. Amounts <= 0
                 * will pick up all the materials that the unit can.
                 *
                 */
                amount: number;
                /**
                 * The material the unit will pick up. 'genarium', 'rarium',
                 * 'legendarium', or 'mythicite'.
                 *
                 */
                material: "genarium" | "rarium" | "legendarium" | "mythicite";
            };
        };

        /**
         * True if successfully taken, false otherwise.
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

/** All the possible specific deltas in Stardash. */
export type StardashSpecificDelta =
    | BodyNextXRanDelta
    | BodyNextYRanDelta
    | BodySpawnRanDelta
    | GameObjectLogRanDelta
    | UnitAttackRanDelta
    | UnitDashRanDelta
    | UnitMineRanDelta
    | UnitMoveRanDelta
    | UnitSafeRanDelta
    | UnitShootdownRanDelta
    | UnitTransferRanDelta
    | AIRunTurnFinishedDelta;

/** The possible delta objects in Stardash. */
export type StardashDelta = GameSpecificDelta<StardashSpecificDelta>;
