import {
    Delta,
    BaseGame as CadreBaseGame,
    BaseGameObject as CadreBaseGameObject,
    BasePlayer,
    Gamelog,
} from "@cadre/ts-utils/cadre";
import * as Color from "color";
import { flatMap, range } from "lodash";
import * as PIXI from "pixi.js";
import * as seedRandom from "seedrandom";
import {
    Immutable,
    isObject,
    objectHasProperty,
    UnknownObject,
} from "src/utils";
import { Viseur } from "src/viseur";
import {
    RendererResources,
    RendererSize,
    Renderer,
} from "src/viseur/renderer";
import {
    BaseSetting,
    BaseSettings,
    CheckBoxSetting,
    ColorSetting,
    createSettings,
} from "src/viseur/settings";
import { PublicEvent } from "ts-typed-events";
import { BaseGameObject } from "./base-game-object";
import { BaseHumanPlayer } from "./base-human-player";
import { BasePane } from "./base-pane";
import { GameOverScreen } from "./game-over-screen";
import {
    BaseGameNamespace,
    BaseGameSettings,
    GameLayers,
    ViseurGameState,
} from "./interfaces";
import { RenderableGameObjectClass } from "./make-renderable";
import { StateObject } from "./state-object";

/** Returned when no delta can be found. */
const NO_DELTA = (Object.freeze({ type: "" }) as unknown) as Delta;

/** The base class all games in the games/ folder inherit from. */
export class BaseGame extends StateObject {
    /** Emitted when a game object wants to be inspected. */
    public readonly eventInspect = new PublicEvent<BaseGameObject>();

    /** The name of the game, should be overridden by sub classes. */
    public static readonly gameName: string = "Base Game";

    /** The number of players in this game. The players array should be this same size. */
    public static readonly numberOfPlayers: number = 2;

    /** Mapping of the class names to their class for all sub GameObject classes. */
    public readonly gameObjectClasses!: Readonly<{
        /** Index to get a game object class from their name. */
        [className: string]: typeof BaseGameObject | undefined;
    }>; // set in Creer template

    /** The current state of the game (dt = 0). */
    public current: Immutable<CadreBaseGame> | undefined;

    /** The next state of the game (dt = 1). */
    public next: Immutable<CadreBaseGame> | undefined;

    /** The reason for the current state. */
    public currentDelta: Immutable<Delta> | undefined;

    /** The reason for the next state. */
    public nextDelta: Immutable<Delta> | undefined;

    /** All the game objects in the game, indexed by their ID. */
    public readonly gameObjects: {
        [id: string]:
            | BaseGameObject
            | InstanceType<RenderableGameObjectClass>
            | undefined;
    } = {};

    /** The players in the game. */
    public readonly players: BaseGameObject[] = [];

    /** The human player, if there is one, in this game. */
    public readonly humanPlayer: BaseHumanPlayer | undefined;

    /** The pane that displays information about this game. */
    public pane: BasePane<CadreBaseGame, BasePlayer> | undefined;

    /**
     * The renderer that provides utility rendering functions
     * (as well as heavy lifting for screen changes).
     */
    public readonly renderer: Renderer;

    /** The settings for this game. */
    public readonly settings!: Readonly<BaseGameSettings>; // set in Creer template

    /** The namespace this game is in. */
    public namespace!: BaseGameNamespace; // set in Creer template

    /** The random number generator we use. */
    public readonly random: seedRandom.prng;

    /** The layers in the game. */
    public readonly layers!: GameLayers; // set in Creer template

    /** The resource factories that can create sprites for this game. */
    public readonly resources!: RendererResources; // set in Creer template

    /** The default player colors, there must be one for each player. */
    public readonly defaultPlayerColors = [
        Color("#C33"), // Player 0
        Color("#33C"), // Player 1
        Color("#3C3"), // Player 2 (probably never will happen), and so on...
        Color("#CC3"),
        Color("#3CC"),
        Color("#C3C"),
    ];

    /** The Viseur instance controlling this game. */
    protected readonly viseur: Viseur;

    /** If this game has a human player interacting with it, then this is their  player id. */
    private readonly humanPlayerID?: string;

    /** The game over screen that displays over the game graphics at the end of rendering. */
    private readonly gameOverScreen: GameOverScreen;

    /** If the game has started or not (basically has everything async loaded). */
    private started = false;

    /** The name of the game. */
    public get name(): string {
        // because inheriting games will override their static game name,
        // we'll get the top level class constructor's static game name here
        return (this.constructor as typeof BaseGame).gameName;
    }

    /** The order of containers, with the last element being the top most layer. */
    private readonly layerOrder: PIXI.Container[] = [];

    /**
     * Initializes the BaseGame, should be invoked by a Game super class.
     *
     * @param viseur - The Viseur instance controlling this game.
     * @param gamelog - The gamelog for this game, may be a streaming gamelog.
     * @param playerID - The player id of the human player, if there is one.
     */
    constructor(
        viseur: Viseur,
        gamelog?: Immutable<Gamelog>,
        playerID?: string,
    ) {
        super();

        this.viseur = viseur;
        this.renderer = viseur.renderer;

        this.random = seedRandom(
            (gamelog && gamelog.settings.randomSeed) || undefined,
        );

        viseur.eventReady.on(() => {
            this.ready();
        });

        viseur.eventStateChangedStep.on((state) => {
            this.initializeGameObjects(state);
        });

        viseur.eventStateChanged.on((state) => {
            this.update(state);
        });

        this.humanPlayerID = playerID;
        if (this.humanPlayerID) {
            this.humanPlayer = new this.namespace.HumanPlayer(this);
        }

        this.gameOverScreen = new GameOverScreen({
            parent: viseur.gui.rendererWrapper,
            game: this,
            viseur: this.viseur,
        });
    }

    /**
     * Gets a game object in an object or with a given id and ensures it is of a given class instance.
     *
     * @param from - Either the ID of instance, or an object with the `id` property.
     * @param Class - The game object Class constructor.
     * @returns The game object if found correctly, undefined otherwise.
     */
    public getGameObject<T extends typeof BaseGameObject>(
        from: unknown,
        Class: T,
    ): InstanceType<T> | undefined {
        const id = String(isObject(from) ? from.id : from);
        const gameObject = this.gameObjects[id];

        return gameObject instanceof Class
            ? (gameObject as InstanceType<T>)
            : undefined;
    }

    /**
     * Gets the current color for a given player, including setting overrides.
     *
     * @param player - The player to get the color for, can be the class instance, state, or its id.
     * @returns That player's color.
     */
    public getPlayersColor(
        player: Immutable<
            BaseGameObject | CadreBaseGameObject | string | number
        >,
    ): Color {
        let index = -1;
        if (typeof player === "number") {
            // No need to look up the player index,
            // as they passed the player index
            index = player;
        } else {
            const id = typeof player === "object" ? player.id : player;

            const playerInstance = this.gameObjects[id];

            // ensure the game object is a player
            if (
                !playerInstance ||
                playerInstance.gameObjectName !== "Player"
            ) {
                throw new Error(
                    `${String(
                        playerInstance,
                    )} is not a player to get a color for!`,
                );
            }

            index = this.players.findIndex((p) => p.id === id);
        }

        if (index < 0) {
            throw new Error(`Could not find a player at index ${index}`);
        }

        if (this.settings.customPlayerColors.get()) {
            return Color(this.settings.playerColors[index].get());
        }

        return this.defaultPlayerColors[index];
    }

    /**
     * Initialize new game objects based on each state step update.
     *
     * @param state - The state for this step.
     */
    public initializeGameObjects(state: Immutable<ViseurGameState>): void {
        // yes update our state during initialization
        super.update(state.game, state.nextGame);

        /**
         * The current state's game objects to use to initialize new game
         * objects we find.
         */
        const gameObjects =
            (state.game && state.game.gameObjects) ||
            (state.nextGame && state.nextGame.gameObjects);

        if (!gameObjects) {
            return; // no game objects to initialize in either state.
        }

        // initialize new game objects we have not seen yet
        const newGameObjects = new Set<BaseGameObject>();
        for (const id of Object.keys(gameObjects).sort()) {
            if (!this.gameObjects[id]) {
                const initialState = gameObjects[id];
                if (!initialState) {
                    throw new Error(
                        `No initial state for new game object #${id}`,
                    );
                }

                const newGameObject = this.createGameObject(id, initialState);
                newGameObjects.add(newGameObject);
                newGameObject.update(
                    state.game && state.game.gameObjects[id],
                    state.nextGame && state.nextGame.gameObjects[id],
                );
            }
        }

        // call stateUpdated after the update above so they all are done.
        const currentDelta =
            state.delta || (state.nextDelta as Immutable<Delta>);
        const nextDelta = state.nextDelta || (state.delta as Immutable<Delta>);
        for (const gameObject of newGameObjects) {
            gameObject.stateUpdated(
                gameObject.getCurrentMostState(),
                gameObject.getNextMostState(),
                currentDelta,
                nextDelta,
            );

            if (newGameObjects.has(gameObject)) {
                gameObject.recolor();
            }
        }
    }

    /**
     * Invoked when the state updates. Intended to be overridden by subclass(es).
     *
     * @param state - The current viseur state to update off of.
     */
    public update(state: Immutable<ViseurGameState>): void {
        if (!this.started) {
            return;
        }

        const current = state.game;
        const next = state.nextGame;
        super.update(current, next);

        this.gameOverScreen.hide();

        // Save the reasons for the current and next deltas
        const { delta, nextDelta } = state;
        this.currentDelta = this.hookupGameObjectReferences(delta);
        this.nextDelta = this.hookupGameObjectReferences(nextDelta);

        const currentMostState = this.getCurrentMostState();
        const nextMostState = this.getNextMostState();
        const currentMostReason = this.getCurrentMostDelta();
        const nextMostReason = this.getNextMostDelta();

        this.stateUpdated(
            currentMostState,
            nextMostState,
            currentMostReason,
            nextMostReason,
        );

        // Update all the game objects now (including those we may have just created)
        for (const [id, gameObject] of Object.entries(this.gameObjects)) {
            if (gameObject) {
                gameObject.update(
                    this.current ? this.current.gameObjects[id] : undefined,
                    this.next ? this.next.gameObjects[id] : undefined,
                );
            }
        }

        // Now they are all updated, so tell them that they are all updated
        for (const [id, gameObject] of Object.entries(this.gameObjects)) {
            if (
                gameObject &&
                ((current && objectHasProperty(current.gameObjects, id)) ||
                    (next && objectHasProperty(next.gameObjects, id)))
            ) {
                gameObject.stateUpdated(
                    gameObject.getCurrentMostState(),
                    gameObject.getNextMostState(),
                    currentMostReason,
                    nextMostReason,
                );
            }
        }

        if (this.pane) {
            this.pane.update(this.getCurrentMostState(), this.next);
        }

        // intended to be overridden so we are calling it
        this.stateUpdated(
            currentMostState,
            nextMostState,
            currentMostReason,
            nextMostReason,
        );
    }

    /**
     * Called at approx 60/sec to render the game, and all the game objects within it.
     *
     * @param dt - The tweening between the index state and the next to render.
     */
    public render(dt: number): void {
        if (!this.started) {
            return;
        }

        const current = this.getCurrentMostState();
        const next = this.getNextMostState();
        const currentMostReason = this.getCurrentMostDelta();
        const nextMostReason = this.getNextMostDelta();

        this.renderBackground(
            dt,
            current,
            next,
            currentMostReason,
            nextMostReason,
        );

        for (const [id, gameObject] of Object.entries(this.gameObjects)) {
            if (
                gameObject &&
                (gameObject.constructor as typeof BaseGameObject).shouldRender
            ) {
                // GameObjects "exist" to be rendered if the have a next or
                // current state,
                // They will not exist if players go back in time to before the
                // GameObject was created.
                if (
                    (current && objectHasProperty(current.gameObjects, id)) ||
                    (next && objectHasProperty(next.gameObjects, id))
                ) {
                    // Then actually render it, otherwise it's invisible so why bother
                    gameObject.render(
                        dt,
                        gameObject.getCurrentMostState(),
                        gameObject.getNextMostState(),
                        currentMostReason,
                        nextMostReason,
                    );
                } else {
                    // else it does not exist currently, so hide it from rendering.
                    gameObject.hideRender();
                }
            }
        }
    }

    /**
     * Gets the current or next delta reason.
     *
     * @returns The current most delta reason.
     */
    public getCurrentMostDelta(): Immutable<Delta> {
        if (!this.currentDelta && !this.nextDelta) {
            return NO_DELTA;
        }

        return (this.currentDelta || this.nextDelta) as Immutable<Delta>;
    }

    /**
     * Gets the next or current delta reason.
     *
     * @returns The next most delta reason.
     */
    public getNextMostDelta(): Immutable<Delta> {
        if (!this.currentDelta && !this.nextDelta) {
            return NO_DELTA;
        }

        return (this.nextDelta || this.currentDelta) as Immutable<Delta>;
    }

    /**
     * Called once to initialize any PIXI objects needed to render the
     * background.
     *
     * @param state - The initial state of the game.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected createBackground(state: Immutable<CadreBaseGame>): void {
        // method exposed for inheriting classes
    }

    /**
     * Renders the static background, called approx 1/60 sec.
     *
     * @param dt - A floating point number [0, 1) which represents how far
     * into the next turn that current turn we are rendering is at.
     * @param current - The current (most) game state, will be this.next
     * if this.current is null.
     * @param next - The next (most) game state, will be this.current if
     * this.next is null.
     * @param reason - The current reason for the current delta.
     * @param nextDelta - The reason for the next delta
     * (why we are transitioning dt).
     */
    protected renderBackground(
        /* eslint-disable @typescript-eslint/no-unused-vars */
        dt: number,
        current: Immutable<CadreBaseGame>,
        next: Immutable<CadreBaseGame>,
        reason: Immutable<Immutable<Delta>>,
        nextDelta: Immutable<Immutable<Delta>>,
        /* eslint-enable @typescript-eslint/no-unused-vars */
    ): void {
        // method exposed for inheriting classes
    }

    /**
     * Invoked when the first game state is ready to setup the dimensions of
     * the renderer.
     *
     * @param state - The initialize state of the game.
     * @returns The {height, width} you for the game's size.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getSize(state: Immutable<CadreBaseGame>): RendererSize {
        // intended to be inherited and returned with useful numbers
        return { width: 10, height: 10 };
    }

    /**
     * Starts the game, basically like init, but after other stuff is ready
     * (like loading textures).
     *
     * @param state - The initial state of the game.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected start(state: Immutable<CadreBaseGame>): void {
        // intended to be inherited
    }

    /**
     * Creates settings for a game, given some base settings, this injects the
     * player colors and returns them as ready to use settings.
     *
     * @param settings - The game's specific settings to setup.
     * @returns The game's settings extended with things!
     */
    protected createSettings<T extends BaseSettings>(
        settings: T,
    ): Readonly<T & BaseGameSettings> {
        // Because other game's settings may have changed the
        // BaseSetting.index, we need to reset it here.
        // So, find the greatest index of the settings we were passed,
        // then add 1 to it because that is the next  new index to use below
        // when we add color settings.

        BaseSetting.newIndex =
            (flatMap(settings) as BaseSetting[]).reduce(
                (max, setting) => Math.max(max, setting.index),
                -1,
            ) + 1; // +1 so the new index is one higher

        const combined = {
            customPlayerColors: new CheckBoxSetting({
                id: "custom-player-colors",
                label: "Custom Player Colors",
                hint: "Use your custom player colors defined below.",
                default: false,
            }),
            playerColors: range(
                (this.constructor as typeof BaseGame).numberOfPlayers,
            ).map(
                (i) =>
                    new ColorSetting({
                        id: `player-color-${i}`,
                        label: `Player ${i} Color`,
                        hint: `Overrides the color for Player ${i}`,
                        default: this.defaultPlayerColors[i].hex(),
                    }),
            ),
            ...(settings as Record<string, unknown>), // silly TS not spreading generics
        };

        return (createSettings(
            this.namespace.Game.gameName,
            combined,
        ) as unknown) as T & BaseGameSettings;
        // ^ TypeScript is still mad about spreading T
    }

    /**
     * Creates a layer for the game, the order this is called is the order they
     * are layered, so call the top layer last.
     *
     * @returns - The new layer.
     */
    protected createLayer(): PIXI.Container {
        const container = new PIXI.Container();
        this.layerOrder.push(container);

        return container;
    }

    /**
     * Creates layers for a game and adds them to the renderer.
     *
     * @param layers - The layers in the game.
     * @returns The layers, now frozen. They cannot be re-created after this.
     */
    protected createLayers<T extends GameLayers>(layers: T): Readonly<T> {
        for (const layer of this.layerOrder) {
            this.renderer.gameContainer.addChild(layer);
        }

        return Object.freeze(layers);
    }

    /**
     * Intended to be overwritten by super classes to recolor their background or whatever.
     */
    protected recolor(): void {
        // pass
    }

    /**
     * Starts the game, basically like init, but after other stuff is ready
     * (like loading textures).
     */
    private ready(): void {
        this.started = true;

        const state = this.viseur.getCurrentState();

        this.initializeGameObjects(state);
        this.update(state);

        this.pane = new this.namespace.Pane(
            this.viseur,
            this,
            this.getNextMostState(),
        );

        if (!this.pane) {
            throw new Error("Game ready without pane!");
        }

        const current = this.getCurrentMostState();
        this.pane.update(current, this.next);

        if (this.humanPlayer && this.humanPlayerID) {
            const player = this.gameObjects[this.humanPlayerID];
            if (!player) {
                throw new Error(
                    `No player for out player ID of '${this.humanPlayerID}'.`,
                );
            }
            this.humanPlayer.setPlayer(player);
            this.pane.setHumanPlayer(this.humanPlayerID);
        }

        // Attach callbacks to recolor this game whenever a color setting changes.
        const doRecolor = () => {
            this.recolorEverything();
            if (this.pane) {
                this.pane.update(
                    this.getCurrentMostState(),
                    this.getNextMostState(),
                );
            }
        };

        this.settings.customPlayerColors.changed.on(doRecolor);
        for (const playerColorSetting of this.settings.playerColors) {
            playerColorSetting.changed.on(doRecolor);
        }

        const size = this.getSize(current);
        this.renderer.setSize(size);
        this.start(current);
        this.createBackground(current);

        if (this.humanPlayer) {
            this.humanPlayer.start();
        }
    }

    /**
     * Find game object references, and hooks them up in an object.
     *
     * @param thing - The value to search through and clone,
     * hooking up game object references when found.
     * @returns A new object, with no game object references.
     */
    private hookupGameObjectReferences<T = unknown>(thing: T): T {
        if (!isObject(thing)) {
            return thing;
        }

        const obj = thing as UnknownObject;
        if (objectHasProperty(obj, "id")) {
            // It's a game object reference, so return that
            return (this.gameObjects[String(obj.id)] as unknown) as T;
        }

        const cloned: UnknownObject = {};
        for (const key of Object.keys(obj)) {
            cloned[key] = this.hookupGameObjectReferences(obj[key]);
        }

        // Messy. It MUST be an object at this point that TS lost that.
        return (cloned as unknown) as T;
    }

    /**
     * Initializes a new game object with the given id.
     *
     * @param id - The id of the game object to initialize.
     * @param state - The initial state of the new game object.
     * @returns The newly created game object.
     */
    private createGameObject(
        id: string,
        state: Immutable<CadreBaseGameObject>,
    ): BaseGameObject {
        const classConstructor = this.gameObjectClasses[state.gameObjectName];

        if (!classConstructor) {
            throw new Error(
                `Could not create instance of ${state.gameObjectName}`,
            );
        }

        const newGameObject = new classConstructor(state, this.viseur);

        /*
        TODO: Fix
        newGameObject.on("inspect", () => {
            this.emit("inspect", newGameObject);
        });
        */

        this.gameObjects[id] = newGameObject;

        if (state.gameObjectName === "Player") {
            // It's a player instance, no easy way to cast that here as there is
            // no BasePlayer class, only the compile time interface.
            (newGameObject as BaseGameObject & {
                /** The player index that must exist on player game objects. */
                playersIndex: number;
            }).playersIndex = this.players.length;

            this.players.push(newGameObject);
        }

        return newGameObject;
    }

    /**
     * Invoked when a player color changes, so all game objects have an
     * opportunity to recolor themselves.
     */
    private recolorEverything(): void {
        this.recolor();
        for (const gameObject of Object.values(this.gameObjects)) {
            if (gameObject) {
                gameObject.recolor();
            }
        }

        if (this.pane) {
            this.pane.recolor();
        }

        this.gameOverScreen.recolor();
    }
}
