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
 * There's an infestation of enemy spiders challenging your queen BroodMother
 * spider! Protect her and attack the other BroodMother in this turn based, node
 * based, game.
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
     * The speed at which Cutters work to do cut Webs.
     *
     */
    cutSpeed: number;

    /**
     * Constant used to calculate how many eggs BroodMothers get on their
     * owner's turns.
     *
     */
    eggsScalar: number;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via ID.
     *
     */
    gameObjects: { [id: string]: GameObjectState };

    /**
     * The starting strength for Webs.
     *
     */
    initialWebStrength: number;

    /**
     * The maximum number of turns before the game will automatically end.
     *
     */
    maxTurns: number;

    /**
     * The maximum strength a web can be strengthened to.
     *
     */
    maxWebStrength: number;

    /**
     * The speed at which Spiderlings move on Webs.
     *
     */
    movementSpeed: number;

    /**
     * Every Nest in the game.
     *
     */
    nests: NestState[];

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
     * The speed at which Spitters work to spit new Webs.
     *
     */
    spitSpeed: number;

    /**
     * The amount of time (in nano-seconds) added after each player performs a
     * turn.
     *
     */
    timeAddedPerTurn: number;

    /**
     * How much web strength is added or removed from Webs when they are weaved.
     *
     */
    weavePower: number;

    /**
     * The speed at which Weavers work to do strengthens and weakens on Webs.
     *
     */
    weaveSpeed: number;

    /**
     * Every Web in the game.
     *
     */
    webs: WebState[];
}

/**
 * The Spider Queen. She alone can spawn Spiderlings for each Player, and if she
 * dies the owner loses.
 *
 */
export interface BroodMotherState extends SpiderState {
    /**
     * How many eggs the BroodMother has to spawn Spiderlings this turn.
     *
     */
    eggs: number;

    /**
     * How much health this BroodMother has left. When it reaches 0, she dies
     * and her owner loses.
     *
     */
    health: number;
}

/**
 * A Spiderling that can cut existing Webs.
 *
 */
export interface CutterState extends SpiderlingState {
    /**
     * The Web that this Cutter is trying to cut. Null if not cutting.
     *
     */
    cuttingWeb: WebState;
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
 * A location (node) connected to other Nests via Webs (edges) in the game that
 * Spiders can converge on, regardless of owner.
 *
 */
export interface NestState extends GameObjectState {
    /**
     * The Player that 'controls' this Nest as they have the most Spiders on
     * this nest.
     *
     */
    controllingPlayer: PlayerState;

    /**
     * All the Spiders currently located on this Nest.
     *
     */
    spiders: SpiderState[];

    /**
     * Webs that connect to this Nest.
     *
     */
    webs: WebState[];

    /**
     * The X coordinate of the Nest. Used for distance calculations.
     *
     */
    x: number;

    /**
     * The Y coordinate of the Nest. Used for distance calculations.
     *
     */
    y: number;
}

/**
 * A player in this game. Every AI controls one player.
 *
 */
export interface PlayerState extends GameObjectState, BasePlayer {
    /**
     * This player's BroodMother. If it dies they lose the game.
     *
     */
    broodMother: BroodMotherState;

    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     *
     */
    clientType: string;

    /**
     * If the player lost the game or not.
     *
     */
    lost: boolean;

    /**
     * The max number of Spiderlings players can spawn.
     *
     */
    maxSpiderlings: number;

    /**
     * The name of the player.
     *
     */
    name: string;

    /**
     * The number of nests this player controls.
     *
     */
    numberOfNestsControlled: number;

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
     * All the Spiders owned by this player.
     *
     */
    spiders: SpiderState[];

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
 * A Spider in the game. The most basic unit.
 *
 */
export interface SpiderState extends GameObjectState {
    /**
     * If this Spider is dead and has been removed from the game.
     *
     */
    isDead: boolean;

    /**
     * The Nest that this Spider is currently on. Null when moving on a Web.
     *
     */
    nest: NestState;

    /**
     * The Player that owns this Spider, and can command it.
     *
     */
    owner: PlayerState;
}

/**
 * A Spider spawned by the BroodMother.
 *
 */
export interface SpiderlingState extends SpiderState {
    /**
     * When empty string this Spiderling is not busy, and can act. Otherwise a
     * string representing what it is busy with, e.g. 'Moving', 'Attacking'.
     *
     */
    busy:
        | ""
        | "Moving"
        | "Attacking"
        | "Strengthening"
        | "Weakening"
        | "Cutting"
        | "Spitting";

    /**
     * The Web this Spiderling is using to move. Null if it is not moving.
     *
     */
    movingOnWeb: WebState;

    /**
     * The Nest this Spiderling is moving to. Null if it is not moving.
     *
     */
    movingToNest: NestState;

    /**
     * The number of Spiderlings busy with the same work this Spiderling is
     * doing, speeding up the task.
     *
     */
    numberOfCoworkers: number;

    /**
     * How much work needs to be done for this Spiderling to finish being busy.
     * See docs for the Work formula.
     *
     */
    workRemaining: number;
}

/**
 * A Spiderling that creates and spits new Webs from the Nest it is on to
 * another Nest, connecting them.
 *
 */
export interface SpitterState extends SpiderlingState {
    /**
     * The Nest that this Spitter is creating a Web to spit at, thus connecting
     * them. Null if not spitting.
     *
     */
    spittingWebToNest: NestState;
}

/**
 * A Spiderling that can alter existing Webs by weaving to add or remove silk
 * from the Webs, thus altering its strength.
 *
 */
export interface WeaverState extends SpiderlingState {
    /**
     * The Web that this Weaver is strengthening. Null if not strengthening.
     *
     */
    strengtheningWeb: WebState;

    /**
     * The Web that this Weaver is weakening. Null if not weakening.
     *
     */
    weakeningWeb: WebState;
}

/**
 * A connection (edge) to a Nest (node) in the game that Spiders can converge on
 * (regardless of owner). Spiders can travel in either direction on Webs.
 *
 */
export interface WebState extends GameObjectState {
    /**
     * How long this Web is, i.e., the distance between its nestA and nestB.
     *
     */
    length: number;

    /**
     * How much weight this Web currently has on it, which is the sum of all its
     * Spiderlings weight.
     *
     */
    load: number;

    /**
     * The first Nest this Web is connected to.
     *
     */
    nestA: NestState;

    /**
     * The second Nest this Web is connected to.
     *
     */
    nestB: NestState;

    /**
     * All the Spiderlings currently moving along this Web.
     *
     */
    spiderlings: SpiderlingState[];

    /**
     * How much weight this Web can take before snapping and destroying itself
     * and all the Spiders on it.
     *
     */
    strength: number;
}

// -- Run Deltas -- \\
/**
 * The delta about what happened when a 'BroodMother' ran their 'consume'
 * function.
 *
 */
export type BroodMotherConsumeRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<BroodMotherState>;

            /** The name of the function of the caller to run. */
            functionName: "consume";

            /**
             * The arguments to BroodMother.consume,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Spiderling to consume. It must be on the same Nest as
                 * this BroodMother.
                 *
                 */
                spiderling: GameObjectInstance<SpiderlingState>;
            };
        };

        /**
         * True if the Spiderling was consumed. False otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'BroodMother' ran their 'spawn'
 * function.
 *
 */
export type BroodMotherSpawnRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<BroodMotherState>;

            /** The name of the function of the caller to run. */
            functionName: "spawn";

            /**
             * The arguments to BroodMother.spawn,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The string name of the Spiderling class you want to Spawn.
                 * Must be 'Spitter', 'Weaver', or 'Cutter'.
                 *
                 */
                spiderlingType: "Spitter" | "Weaver" | "Cutter";
            };
        };

        /**
         * The newly spawned Spiderling if successful. Null otherwise.
         *
         */
        returned: GameObjectInstance<SpiderlingState>;
    };
};

/**
 * The delta about what happened when a 'Cutter' ran their 'cut' function.
 *
 */
export type CutterCutRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<CutterState>;

            /** The name of the function of the caller to run. */
            functionName: "cut";

            /**
             * The arguments to Cutter.cut,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The web you want to Cut. Must be connected to the Nest this
                 * Cutter is currently on.
                 *
                 */
                web: GameObjectInstance<WebState>;
            };
        };

        /**
         * True if the cut was successfully started, false otherwise.
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
 * The delta about what happened when a 'Spiderling' ran their 'attack'
 * function.
 *
 */
export type SpiderlingAttackRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<SpiderlingState>;

            /** The name of the function of the caller to run. */
            functionName: "attack";

            /**
             * The arguments to Spiderling.attack,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Spiderling to attack.
                 *
                 */
                spiderling: GameObjectInstance<SpiderlingState>;
            };
        };

        /**
         * True if the attack was successful, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Spiderling' ran their 'move' function.
 *
 */
export type SpiderlingMoveRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<SpiderlingState>;

            /** The name of the function of the caller to run. */
            functionName: "move";

            /**
             * The arguments to Spiderling.move,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Web you want to move across to the other Nest.
                 *
                 */
                web: GameObjectInstance<WebState>;
            };
        };

        /**
         * True if the move was successful, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Spitter' ran their 'spit' function.
 *
 */
export type SpitterSpitRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<SpitterState>;

            /** The name of the function of the caller to run. */
            functionName: "spit";

            /**
             * The arguments to Spitter.spit,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Nest you want to spit a Web to, thus connecting that Nest
                 * and the one the Spitter is on.
                 *
                 */
                nest: GameObjectInstance<NestState>;
            };
        };

        /**
         * True if the spit was successful, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Weaver' ran their 'strengthen'
 * function.
 *
 */
export type WeaverStrengthenRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<WeaverState>;

            /** The name of the function of the caller to run. */
            functionName: "strengthen";

            /**
             * The arguments to Weaver.strengthen,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The web you want to strengthen. Must be connected to the Nest
                 * this Weaver is currently on.
                 *
                 */
                web: GameObjectInstance<WebState>;
            };
        };

        /**
         * True if the strengthen was successfully started, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Weaver' ran their 'weaken' function.
 *
 */
export type WeaverWeakenRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<WeaverState>;

            /** The name of the function of the caller to run. */
            functionName: "weaken";

            /**
             * The arguments to Weaver.weaken,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The web you want to weaken. Must be connected to the Nest
                 * this Weaver is currently on.
                 *
                 */
                web: GameObjectInstance<WebState>;
            };
        };

        /**
         * True if the weaken was successfully started, false otherwise.
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

/** All the possible specific deltas in Spiders. */
export type SpidersSpecificDelta =
    | BroodMotherConsumeRanDelta
    | BroodMotherSpawnRanDelta
    | CutterCutRanDelta
    | GameObjectLogRanDelta
    | SpiderlingAttackRanDelta
    | SpiderlingMoveRanDelta
    | SpitterSpitRanDelta
    | WeaverStrengthenRanDelta
    | WeaverWeakenRanDelta
    | AIRunTurnFinishedDelta;

/** The possible delta objects in Spiders. */
export type SpidersDelta = GameSpecificDelta<SpidersSpecificDelta>;
