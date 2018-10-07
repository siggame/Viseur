import { IBaseGame, IBaseGameObject, IGamelog } from "cadre-ts-utils/cadre";
import { Chance } from "chance";
import * as Color from "color";
import flatMap from "lodash/flatMap";
import range from "lodash/range";
import * as PIXI from "pixi.js";
import { Immutable, isObject, Mutable, objectHasProperty, UnknownObject } from "src/utils";
import { Viseur } from "src/viseur";
import { IRendererResources, IRendererSize, Renderer } from "src/viseur/renderer";
import { BaseSetting, CheckBoxSetting, ColorSetting, createSettings, IBaseSettings } from "src/viseur/settings";
import { BaseGameObject } from "./base-game-object";
import { BaseHumanPlayer } from "./base-human-player";
import { BasePane } from "./base-pane";
import { IBasePlayerInstance } from "./base-player";
import { GameOverScreen } from "./game-over-screen";
import { DeltaReason } from "./gamelog";
import { IBaseGameNamespace, IBaseGameSettings, IGameLayers, IViseurGameState } from "./interfaces";
import { StateObject } from "./state-object";

/** The base class all games in the games/ folder inherit from */
export class BaseGame extends StateObject {
    /** The name of the game, should be overridden by sub classes */
    public static readonly gameName: string = "Base Game";

    /** The number of players in this game. the players array should be this same size. */
    public readonly numberOfPlayers: number = 2;

    /** Mapping of the class names to their class for all sub GameObject classes. */
    public readonly gameObjectClasses!: Readonly<{
         /** index to get a game object class from their name */
        [className: string]: typeof BaseGameObject | undefined;
    }>; // set in Creer template

    /** The current state of the game (dt = 0) */
    public current: IBaseGame | undefined;

    /** The next state of the game (dt = 1) */
    public next: IBaseGame | undefined;

    /** The reason for the current state */
    public currentReason: DeltaReason | undefined;

    /** The reason for the next state */
    public nextReason: DeltaReason | undefined;

    /** All the game objects in the game, indexed by their ID */
    public readonly gameObjects: {[id: string]: BaseGameObject} = {};

    /** The players in the game */
    public readonly players: BaseGameObject[] = [];

    /** The human player, if there is one, in this game */
    public readonly humanPlayer: BaseHumanPlayer | undefined;

    /** The pane that displays information about this game */
    public pane: BasePane<IBaseGame, IBasePlayerInstance> | undefined;

    /** The renderer that provides utility rendering functions (as well as heavy lifting for screen changes) */
    public readonly renderer: Renderer;

    /** The settings for this game */
    public readonly settings!: Immutable<IBaseGameSettings>; // set in Creer template

    /** The namespace this game is in */
    public namespace!: IBaseGameNamespace; // set in Creer template

    /** The random number generator we use */
    public readonly chance: Chance.Chance;

    /** The layers in the game */
    public readonly layers!: IGameLayers; // set in Creer template

    /** The resource factories that can create sprites for this game */
    public readonly resources!: IRendererResources; // set in Creer template

    /** The default player colors, there must be one for each player */
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
    private started: boolean = false;

    /** The name of the game */
    public get name(): string {
        // because inheriting games will override their static game name,
        // we'll get the top level class constructor's static game name here
        // tslint:disable-next-line:no-any no-unsafe-any
        return (this.constructor as any).gameName;
    }

    /** The order of containers, with the last element being the top most layer. */
    private readonly layerOrder: PIXI.Container[] = [];

    /**
     * Initializes the BaseGame, should be invoked by a Game super class.
     *
     * @param viseur - The Viseur instance controlling this game.
     * @param gamelog - The gamelog for this game, may be a streaming gamelog.
     * @param playerID - the player id of the human player, if there is one.
     */
    constructor(viseur: Viseur, gamelog?: IGamelog, playerID?: string) {
        super();

        this.viseur = viseur;
        this.renderer = viseur.renderer;

        this.chance = new Chance(gamelog
            ? gamelog.settings.randomSeed
            : "",
        );

        viseur.events.ready.on(() => {
            this.ready();
        });

        viseur.events.stateChangedStep.on((state) => {
            this.initializeGameObjects(state);
        });

        viseur.events.stateChanged.on((state) => {
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
     * Gets the current color for a given player, including setting overrides.
     *
     * @param player - The player to get the color for, can be the class instance, state, or its id.
     * @returns That player's color.
     */
    public getPlayersColor(
        player: Immutable<BaseGameObject | IBaseGameObject | string | number>,
    ): Color {
        let index = -1;
        if (typeof(player) === "number") {
            // No need to look up the player index,
            // as they passed the player index
            index = player;
        }
        else {
            const id = typeof(player) === "object"
                ? player.id
                : player;

            const playerInstance = this.gameObjects[id];

            // ensure the game object is a player
            if (playerInstance.gameObjectName !== "Player") {
                throw new Error(`${playerInstance} is not a player to get a color for!`);
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
     * @param state - The state for this step
     */
    public initializeGameObjects(state: Immutable<IViseurGameState>): void {
        // yes update our state during initialization
        super.update(state.game, state.nextGame);

        /**
         * The current state's game objects to use to initialize new game
         * objects we find.
         */
        const gameObjects = (state.game && state.game.gameObjects)
                         || (state.nextGame && state.nextGame.gameObjects);

        if (!gameObjects) {
            return; // no game objects to initialize in either state.
        }

        // initialize new game objects we have not seen yet
        const newGameObjects = new Set<BaseGameObject>();
        for (const id of Object.keys(gameObjects).sort()) {
            if (!this.gameObjects[id]) {
                const initialState = gameObjects[id];
                if (!initialState) {
                    throw new Error(`No initial state for new game object #${id}`);
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
        const currentReason = state.reason || state.nextReason as DeltaReason;
        const nextReason = state.nextReason || state.reason as DeltaReason;
        for (const gameObject of newGameObjects) {
            gameObject.stateUpdated(
                gameObject.getCurrentMostState(),
                gameObject.getNextMostState(),
                currentReason,
                nextReason,
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
    public update(state: Immutable<IViseurGameState>): void {
        if (!this.started) {
            return;
        }

        const current = state.game;
        const next = state.nextGame;
        super.update(current, next);

        this.gameOverScreen.hide();

        // Save the reasons for the current and next deltas
        const { reason , nextReason } = state as Mutable<IViseurGameState>;
        this.currentReason = this.hookupGameObjectReferences(reason);
        this.nextReason = this.hookupGameObjectReferences(nextReason);

        const currentMostState = this.getCurrentMostState();
        const nextMostState = this.getNextMostState();
        const currentMostReason = this.getCurrentMostReason();
        const nextMostReason = this.getNextMostReason();

        this.stateUpdated(
            currentMostState,
            nextMostState,
            currentMostReason,
            nextMostReason,
        );

        // Update all the game objects now (including those we may have just created)
        for (const id of Object.keys(this.gameObjects)) {
            this.gameObjects[id].update(
                this.current ? this.current.gameObjects[id] : undefined,
                this.next ? this.next.gameObjects[id] : undefined,
            );
        }

        // Now they are all updated, so tell them that they are all updated
        for (const id of Object.keys(this.gameObjects)) {
            const gameObject = this.gameObjects[id];

            if ((current && current.gameObjects.hasOwnProperty(id)) || (next && next.gameObjects.hasOwnProperty(id))) {
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
        const currentMostReason = this.getCurrentMostReason();
        const nextMostReason = this.getNextMostReason();

        this.renderBackground(
            dt,
            current,
            next,
            currentMostReason,
            nextMostReason,
        );

        for (const [ id, gameObject ] of Object.entries(this.gameObjects)) {
            // GameObjects "exist" to be rendered if the have a next or
            // current state,
            // They will not exist if players go back in time to before the
            // GameObject was created.
            const exists = (current && current.gameObjects.hasOwnProperty(id))
                        || (next && next.gameObjects.hasOwnProperty(id));

            if (gameObject.container) {
                // If it does not exist, no not render them;
                // Else make them visible, and later we'll call their render().
                gameObject.container.visible = Boolean(exists);
            }

            // game objects by default do not render, as many are invisible
            // so check to make sure it exists and we should render it before
            // waste resources rendering that game object
            if (exists && gameObject.shouldRender) {
                gameObject.render(
                    dt,
                    gameObject.getCurrentMostState(),
                    gameObject.getNextMostState(),
                    currentMostReason,
                    nextMostReason,
                );
            }
        }
    }

    /**
     * Gets the current or next delta reason.
     *
     * @returns The current most delta reason.
     */
    public getCurrentMostReason(): DeltaReason {
        if (!this.currentReason && !this.nextReason) {
            throw new Error("No delta reason!");
        }

        return (this.currentReason || this.nextReason) as DeltaReason;
    }

    /**
     * Gets the next or current delta reason.
     *
     * @returns The next most delta reason.
     */
    public getNextMostReason(): DeltaReason {
        if (!this.currentReason && !this.nextReason) {
            throw new Error("No delta reason!");
        }

        return (this.nextReason || this.currentReason) as DeltaReason;
    }

    /**
     * Called once to initialize any PIXI objects needed to render the
     * background.
     *
     * @param state - The initial state of the game.
     */
    protected createBackground(state: Immutable<IBaseGame>): void {
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
     * @param nextReason - The reason for the next delta
     * (why we are transitioning dt).
     */
    protected renderBackground(
        dt: number,
        current: Immutable<IBaseGame>,
        next: Immutable<IBaseGame>,
        reason: Immutable<DeltaReason>,
        nextReason: Immutable<DeltaReason>,
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
    protected getSize(state: Immutable<IBaseGame>): IRendererSize {
        // intended to be inherited and returned with useful numbers
        return { width: 10, height: 10 };
    }

    /**
     * Starts the game, basically like init, but after other stuff is ready
     * (like loading textures).
     *
     * @param state - The initial state of the game.
     */
    protected start(state: Immutable<IBaseGame>): void {
        // intended to be inherited
    }

    /**
     * Creates settings for a game, given some base settings, this injects the
     * player colors and returns them as ready to use settings.
     *
     * @param settings - The game's specific settings to setup.
     * @returns The game's settings extended with things!
     */
    protected createSettings<T extends IBaseSettings>(settings: T): Readonly<T> {
        // Because other game's settings may have changed the
        // BaseSetting.index, we need to reset it here.
        // So, find the greatest index of the settings we were passed,
        // then add 1 to it because that is the next  new index to use below
        // when we add color settings.

        BaseSetting.newIndex = (flatMap(settings) as BaseSetting[]).reduce(
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
            playerColors: range(this.numberOfPlayers).map((i) => new ColorSetting({
                id: `player-color-${i}`,
                label: `Player ${i} Color`,
                hint: `Overrides the color for Player ${i}`,
                default: this.defaultPlayerColors[i].hex(),
            })),
            ...settings as {}, // silly TS not spreading generics
        };

        // tslint:disable-next-line:no-any no-unsafe-any
        return createSettings(this.namespace.Game.gameName, combined) as any;
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
    protected createLayers<T extends IGameLayers>(layers: T): Readonly<T> {
        for (const layer of this.layerOrder) {
            this.renderer.gameContainer.addChild(layer);
        }

        return Object.freeze(layers);
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
            this.humanPlayer.setPlayer(this.gameObjects[this.humanPlayerID]);
            this.pane.setHumanPlayer(this.humanPlayerID);
        }

        // Attach callbacks to recolor this game whenever a color setting
        // changes.
        const recolor = () => this.recolor();
        this.settings.customPlayerColors.changed.on(recolor);
        for (const playerColorSetting of this.settings.playerColors) {
            playerColorSetting.changed.on(recolor);
        }

        const size = this.getSize(current);
        this.renderer.setSize(size);
        this.start(current);
        this.createBackground(current);
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
            // tslint:disable-next-line:no-any no-unsafe-any
            return this.gameObjects[String(obj.id)] as any;
        }

        const cloned: UnknownObject = {};
        for (const key of Object.keys(obj)) {
            cloned[key] = this.hookupGameObjectReferences(obj[key]);
        }

        return cloned as T;
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
        state: Immutable<IBaseGameObject>,
    ): BaseGameObject {
        const classConstructor = this.gameObjectClasses[state.gameObjectName];

        if (!classConstructor) {
            throw new Error(`Could not create instance of ${state.gameObjectName}`);
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
            (newGameObject as BaseGameObject & { playersIndex: number }).playersIndex = this.players.length;

            this.players.push(newGameObject);
        }

        return newGameObject;
    }

    /**
     * Invoked when a player color changes, so all game objects have an opportunity to recolor themselves
     */
    private recolor(): void {
        for (const id of Object.keys(this.gameObjects)) {
            this.gameObjects[id].recolor();
        }

        if (this.pane) {
            this.pane.recolor();
        }

        this.gameOverScreen.recolor();
    }
}
