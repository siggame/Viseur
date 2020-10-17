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
 * Use cowboys to have a good time and play some music on a Piano, while
 * brawling with enemy Cowboys.
 *
 */
export interface GameState extends BaseGame {
    /**
     * How many turns a Bartender will be busy for after throwing a Bottle.
     *
     */
    bartenderCooldown: number;

    /**
     * All the beer Bottles currently flying across the saloon in the game.
     *
     */
    bottles: BottleState[];

    /**
     * How much damage is applied to neighboring things bit by the Sharpshooter
     * between turns.
     *
     */
    brawlerDamage: number;

    /**
     * Every Cowboy in the game.
     *
     */
    cowboys: CowboyState[];

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
     * Every furnishing in the game.
     *
     */
    furnishings: FurnishingState[];

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via ID.
     *
     */
    gameObjects: { [id: string]: GameObjectState };

    /**
     * All the jobs that Cowboys can be called in with.
     *
     */
    jobs: string[];

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
     * The maximum number of Cowboys a Player can bring into the saloon of each
     * specific job.
     *
     */
    maxCowboysPerJob: number;

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
     * When a player's rowdiness reaches or exceeds this number their Cowboys
     * take a collective siesta.
     *
     */
    rowdinessToSiesta: number;

    /**
     * A unique identifier for the game instance that is being played.
     *
     */
    session: string;

    /**
     * How much damage is applied to things hit by Sharpshooters when they act.
     *
     */
    sharpshooterDamage: number;

    /**
     * How long siestas are for a player's team.
     *
     */
    siestaLength: number;

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
     * How many turns a Cowboy will be drunk for if a bottle breaks on it.
     *
     */
    turnsDrunk: number;
}

/**
 * A bottle thrown by a bartender at a Tile.
 *
 */
export interface BottleState extends GameObjectState {
    /**
     * The Direction this Bottle is flying and will move to between turns, can
     * be 'North', 'East', 'South', or 'West'.
     *
     */
    direction: "North" | "East" | "South" | "West";

    /**
     * The direction any Cowboys hit by this will move, can be 'North', 'East',
     * 'South', or 'West'.
     *
     */
    drunkDirection: "North" | "East" | "South" | "West";

    /**
     * True if this Bottle has impacted and has been destroyed (removed from the
     * Game). False if still in the game flying through the saloon.
     *
     */
    isDestroyed: boolean;

    /**
     * The Tile this bottle is currently flying over.
     *
     */
    tile: TileState;
}

/**
 * A person on the map that can move around and interact within the saloon.
 *
 */
export interface CowboyState extends GameObjectState {
    /**
     * If the Cowboy can be moved this turn via its owner.
     *
     */
    canMove: boolean;

    /**
     * The direction this Cowboy is moving while drunk. Will be 'North', 'East',
     * 'South', or 'West' when drunk; or '' (empty string) when not drunk.
     *
     */
    drunkDirection: "" | "North" | "East" | "South" | "West";

    /**
     * How much focus this Cowboy has. Different Jobs do different things with
     * their Cowboy's focus.
     *
     */
    focus: number;

    /**
     * How much health this Cowboy currently has.
     *
     */
    health: number;

    /**
     * If this Cowboy is dead and has been removed from the game.
     *
     */
    isDead: boolean;

    /**
     * If this Cowboy is drunk, and will automatically walk.
     *
     */
    isDrunk: boolean;

    /**
     * The job that this Cowboy does, and dictates how they fight and interact
     * within the Saloon.
     *
     */
    job: "Bartender" | "Brawler" | "Sharpshooter";

    /**
     * The Player that owns and can control this Cowboy.
     *
     */
    owner: PlayerState;

    /**
     * The Tile that this Cowboy is located on.
     *
     */
    tile: TileState;

    /**
     * How many times this unit has been drunk before taking their siesta and
     * resetting this to 0.
     *
     */
    tolerance: number;

    /**
     * How many turns this unit has remaining before it is no longer busy and
     * can `act()` or `play()` again.
     *
     */
    turnsBusy: number;
}

/**
 * An furnishing in the Saloon that must be pathed around, or destroyed.
 *
 */
export interface FurnishingState extends GameObjectState {
    /**
     * How much health this Furnishing currently has.
     *
     */
    health: number;

    /**
     * If this Furnishing has been destroyed, and has been removed from the
     * game.
     *
     */
    isDestroyed: boolean;

    /**
     * True if this Furnishing is a piano and can be played, False otherwise.
     *
     */
    isPiano: boolean;

    /**
     * If this is a piano and a Cowboy is playing it this turn.
     *
     */
    isPlaying: boolean;

    /**
     * The Tile that this Furnishing is located on.
     *
     */
    tile: TileState;
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
     * Every Cowboy owned by this Player.
     *
     */
    cowboys: CowboyState[];

    /**
     * How many enemy Cowboys this player's team has killed.
     *
     */
    kills: number;

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
     * How rowdy their team is. When it gets too high their team takes a
     * collective siesta.
     *
     */
    rowdiness: number;

    /**
     * How many times their team has played a piano.
     *
     */
    score: number;

    /**
     * 0 when not having a team siesta. When greater than 0 represents how many
     * turns left for the team siesta to complete.
     *
     */
    siesta: number;

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
     * The YoungGun this Player uses to call in new Cowboys.
     *
     */
    youngGun: YoungGunState;
}

/**
 * A Tile in the game that makes up the 2D map grid.
 *
 */
export interface TileState extends GameObjectState {
    /**
     * The beer Bottle currently flying over this Tile, null otherwise.
     *
     */
    bottle: BottleState;

    /**
     * The Cowboy that is on this Tile, null otherwise.
     *
     */
    cowboy: CowboyState;

    /**
     * The furnishing that is on this Tile, null otherwise.
     *
     */
    furnishing: FurnishingState;

    /**
     * If this Tile is pathable, but has a hazard that damages Cowboys that path
     * through it.
     *
     */
    hasHazard: boolean;

    /**
     * If this Tile is a balcony of the Saloon that YoungGuns walk around on,
     * and can never be pathed through by Cowboys.
     *
     */
    isBalcony: boolean;

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

    /**
     * The YoungGun on this tile, null otherwise.
     *
     */
    youngGun: YoungGunState;
}

/**
 * An eager young person that wants to join your gang, and will call in the
 * veteran Cowboys you need to win the brawl in the saloon.
 *
 */
export interface YoungGunState extends GameObjectState {
    /**
     * The Tile that a Cowboy will be called in on if this YoungGun calls in a
     * Cowboy.
     *
     */
    callInTile: TileState;

    /**
     * True if the YoungGun can call in a Cowboy, false otherwise.
     *
     */
    canCallIn: boolean;

    /**
     * The Player that owns and can control this YoungGun.
     *
     */
    owner: PlayerState;

    /**
     * The Tile this YoungGun is currently on.
     *
     */
    tile: TileState;
}

// -- Run Deltas -- \\
/**
 * The delta about what happened when a 'Cowboy' ran their 'act' function.
 *
 */
export type CowboyActRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<CowboyState>;

            /** The name of the function of the caller to run. */
            functionName: "act";

            /**
             * The arguments to Cowboy.act,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile you want this Cowboy to act on.
                 *
                 */
                tile: GameObjectInstance<TileState>;
                /**
                 * The direction the bottle will cause drunk cowboys to be in,
                 * can be 'North', 'East', 'South', or 'West'.
                 *
                 */
                drunkDirection: "" | "North" | "East" | "South" | "West";
            };
        };

        /**
         * True if the act worked, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Cowboy' ran their 'move' function.
 *
 */
export type CowboyMoveRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<CowboyState>;

            /** The name of the function of the caller to run. */
            functionName: "move";

            /**
             * The arguments to Cowboy.move,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile you want to move this Cowboy to.
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
 * The delta about what happened when a 'Cowboy' ran their 'play' function.
 *
 */
export type CowboyPlayRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<CowboyState>;

            /** The name of the function of the caller to run. */
            functionName: "play";

            /**
             * The arguments to Cowboy.play,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Furnishing that is a piano you want to play.
                 *
                 */
                piano: GameObjectInstance<FurnishingState>;
            };
        };

        /**
         * True if the play worked, false otherwise.
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
 * The delta about what happened when a 'YoungGun' ran their 'callIn' function.
 *
 */
export type YoungGunCallInRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<YoungGunState>;

            /** The name of the function of the caller to run. */
            functionName: "callIn";

            /**
             * The arguments to YoungGun.callIn,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The job you want the Cowboy being brought to have.
                 *
                 */
                job: "Bartender" | "Brawler" | "Sharpshooter";
            };
        };

        /**
         * The new Cowboy that was called in if valid. They will not be added to
         * any `cowboys` lists until the turn ends. Null otherwise.
         *
         */
        returned: GameObjectInstance<CowboyState>;
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

/** All the possible specific deltas in Saloon. */
export type SaloonSpecificDelta =
    | CowboyActRanDelta
    | CowboyMoveRanDelta
    | CowboyPlayRanDelta
    | GameObjectLogRanDelta
    | YoungGunCallInRanDelta
    | AIRunTurnFinishedDelta;

/** The possible delta objects in Saloon. */
export type SaloonDelta = GameSpecificDelta<SaloonSpecificDelta>;
