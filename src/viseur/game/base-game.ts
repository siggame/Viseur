import { IBasePlayer } from "cadre-ts-utils/cadre";
import { Chance } from "chance";
import * as Color from "color";
import * as PIXI from "pixi.js";
import { IViseurGameState, Viseur } from "src/viseur";
import { IRendererResources, IRendererSize, Renderer } from "src/viseur/renderer";
import * as Settings from "src/viseur/settings";
import { BaseGameObject } from "./base-game-object";
import { BaseHumanPlayer } from "./base-human-player";
import { BasePane } from "./base-pane";
import { IBasePlayerInstance } from "./base-player";
import { GameOverScreen } from "./game-over-screen";
import { IDeltaReason, IGamelog } from "./gamelog";
import { IBaseGameNamespace, IBaseGameObjectClasses, IBaseGameObjectState,
         IBaseGameSettings, IBaseGameState, IGameLayers } from "./interfaces";
import { IState, StateObject } from "./state-object";

/** The base class all games in the games/ folder inherit from */
export class BaseGame extends StateObject {
    /** The name of the game, should be overridden by sub classes */
    public static readonly gameName: string = "Base Game";

    /** The number of players in this game. the players array should be this same size */
    public readonly numberOfPlayers: number = 2;

    /** Mapping of the class names to their class for all sub game object classes */
    public readonly gameObjectClasses!: Readonly<IBaseGameObjectClasses>; // set in Creer template

    /** The current state of the game (dt = 0) */
    public current: IBaseGameState | undefined;

    /** The next state of the game (dt = 1) */
    public next: IBaseGameState | undefined;

    /** The reason for the current state */
    public currentReason: IDeltaReason | undefined;

    /** The reason for the next state */
    public nextReason: IDeltaReason | undefined;

    /** All the game objects in the game, indexed by their ID */
    public readonly gameObjects: {[id: string]: BaseGameObject} = {};

    /** The players in the game */
    public readonly players: BaseGameObject[] = [];

    /** The human player, if there is one, in this game */
    public readonly humanPlayer: BaseHumanPlayer | undefined;

    /** The pane that displays information about this game */
    public pane: BasePane<IBaseGameState, IBasePlayerInstance> | undefined;

    /** The renderer that provides utility rendering functions (as well as heavy lifting for screen changes) */
    public readonly renderer: Renderer;

    /** The settings for this game */
    public readonly settings!: Readonly<IBaseGameSettings>; // set in Creer template

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
        Color("#C33"), Color("#33C"), Color("#3C3"), Color("#CC3"), Color("#3CC"), Color("#C3C"),
    ];

    /** The Viseur instance controlling this game. */
    protected readonly viseur: Viseur;

    /** If this game has a human player interacting with it, then this is their player id */
    private readonly humanPlayerID?: string;

    /** The game over screen that displays over the game graphics at the end of rendering */
    private readonly gameOverScreen: GameOverScreen;

    /** If the game has started or not (basically has everything async loaded) */
    private started: boolean = false;

    /** The name of the game */
    public get name(): string {
        // because inheriting games will override their static game name,
        // we'll get the top level class constructor's static game name here
        // tslint:disable-next-line:no-any no-unsafe-any
        return (this.constructor as any).gameName;
    }

    /** The order of containers, with the last element being the top most layer */
    private readonly layerOrder: PIXI.Container[] = [];

    /**
     * Initializes the BaseGame, should be invoked by a Game super class
     * @param viseur The Viseur instance controlling this game
     * @param gamelog the gamelog for this game, may be a streaming gamelog
     * @param [playerID] the player id of the human player, if there is one
     */
    constructor(viseur: Viseur, gamelog?: IGamelog, playerID?: string) {
        super();

        this.viseur = viseur;
        this.renderer = viseur.renderer;

        this.chance = new Chance(gamelog
            ? gamelog.randomSeed
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
     * Gets the current color for a given player, including setting overrides
     * @param player the player to get the color for, can be the class instance, state, or its id
     * @returns that players color
     */
    public getPlayersColor(player: BaseGameObject | IBaseGameObjectState | string | number): Color {
        let index = -1;
        if (typeof(player) === "number") {
            // no need to look up the player index, as they passed the player index
            index = player;
        }
        else {
            const id = typeof(player) === "object"
                ? player.id
                : player;

            const playerInstance = this.gameObjects[id];

            if (playerInstance.gameObjectName !== "Player") {
                throw new Error(`${playerInstance} is not a player to get a color for!`);
            }

            // we can safely assume now this is a player, so it's safe to assume it has this member
            // index = ((playerInstance as any) as IBasePlayer).playersIndex;

            for (let i = 0; i < this.players.length; i++) {
                if (this.players[i].id === id) {
                    index = i;
                    break;
                }
            }
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
    public initializeGameObjects(state: IViseurGameState): void {
        super.update(state.game, state.nextGame); // yes update our state during initialization

        /** The current state's game objects to use to initialize new game objects we find */
        const gameObjects = (state.game && state.game.gameObjects)
                         || (state.nextGame && state.nextGame.gameObjects);

        // initialize new game objects we have not seen yet
        const newGameObjects = new Set<BaseGameObject>();
        for (const id of Object.keys(gameObjects).sort()) {
            if (!this.gameObjects[id]) {
                const newGameObject = this.createGameObject(id, gameObjects[id]);

                newGameObjects.add(newGameObject);
                newGameObject.update(
                    state.game && state.game.gameObjects[id],
                    state.nextGame && state.nextGame.gameObjects[id],
                    state.reason,
                    state.nextReason,
                );
            }
        }

        for (const gameObject of newGameObjects) {
            gameObject.stateUpdated(
                gameObject.current || gameObject.next!,
                gameObject.next || gameObject.current!,
                state.reason || state.nextReason!,
                state.nextReason || state.reason!,
            );

            if (newGameObjects.has(gameObject)) {
                gameObject.recolor();
            }
        }
    }

    /**
     * Invoked when the state updates. Intended to be overridden by subclass(es)
     *
     * @param state the current viseur state to update off of
     */
    public update(state: IViseurGameState): void {
        if (!this.started) {
            return;
        }

        const current = state.game;
        const next = state.nextGame;
        const { reason, nextReason } = state;

        super.update(current, next, reason, nextReason);

        this.gameOverScreen.hide();

        // save the reasons for the current and next deltas
        this.currentReason = this.hookupGameObjectReferences(reason);
        this.nextReason = this.hookupGameObjectReferences(nextReason);

        this.stateUpdated(
            current || next as IState,
            next || current as IState,
            this.currentReason || this.nextReason,
            this.nextReason || this.currentReason,
        );

        // update all the game objects now (including those we may have just created)
        for (const id of Object.keys(this.gameObjects)) {
            this.gameObjects[id].update(
                this.current ? this.current.gameObjects[id] : undefined,
                this.next ? this.next.gameObjects[id] : undefined,
                reason,
                nextReason,
            );
        }

        // now they are all updated, so tell them that they are all updated
        for (const id of Object.keys(this.gameObjects)) {
            const gameObject = this.gameObjects[id];

            if ((current && current.gameObjects.hasOwnProperty(id)) || (next && next.gameObjects.hasOwnProperty(id))) {
                gameObject.stateUpdated(
                    gameObject.current || gameObject.next,
                    gameObject.next || gameObject.current,
                    this.currentReason || this.nextReason,
                    this.nextReason || this.currentReason,
                );
            }
        }

        if (this.pane) {
            this.pane.update(this.current || this.next!, this.next);
        }

        // intended to be overridden so we are calling it
        this.stateUpdated(
            this.current || this.next!,
            this.next || this.current!,
            this.currentReason || this.nextReason!,
            this.nextReason || this.currentReason!,
        );
    }

    /**
     * Called at approx 60/sec to render the game, and all the game objects within it
     * @param index the index of the state to render
     * @param dt - the tweening between the index state and the next to render
     */
    public render(index: number, dt: number): void {
        if (!this.started) {
            return;
        }

        const current = this.current || this.next;
        const next = this.next || this.current;

        this.renderBackground(
            dt,
            current || next!,
            next || current!,
            this.currentReason || this.nextReason!,
            this.nextReason || this.currentReason!,
        );

        for (const id of Object.keys(this.gameObjects)) {
            const gameObject = this.gameObjects[id];

            // game objects "exist" to be rendered if the have a next or current state,
            // they will not exist if players go back in time to before the game object was created
            const exists = (current && current.gameObjects.hasOwnProperty(id))
                        || (next && next.gameObjects.hasOwnProperty(id));

            if (gameObject.container) {
                // if it does not exist, no not render them, otherwise do, and later we'll call their render()
                gameObject.container.visible = Boolean(exists);
            }

            // game objects by default do not render, as many are invisible
            // so check to make sure it exists and we should render it before
            // waste resources rendering that game object
            if (exists && gameObject.shouldRender) {
                gameObject.render(
                    dt,
                    gameObject.current || gameObject.next!,
                    gameObject.next || gameObject.current!,
                    this.currentReason || this.nextReason!,
                    this.nextReason || this.currentReason!,
                );
            }
        }
    }

    public getCurrentMostState(): NonNullable<this["current"]> {
        if (!this.current || !this.next) {
            throw new Error("No game state to get!");
        }

        return (this.current || this.next) as NonNullable<this["current"]>;
    }

    /**
     * Called once to initialize any PIXI objects needed to render the background
     * @param state the initial state of the game
     */
    protected createBackground(state: IBaseGameState): void {
        // method exposed for inheriting classes
    }

    /**
     * renders the static background, called approx 1/60 sec
     * @param dt a floating point number [0, 1) which represents how
     *                    far into the next turn that current turn we are
     *                    rendering is at
     * @param current the current (most) game state, will be this.next
     *                         if this.current is null
     * @param next the next (most) game state, will be this.current if
     *                      this.next is null
     * @param reason the current reason for the current delta
     * @param nextReason the reason for the next delta (why we are transitioning dt)
     */
    protected renderBackground(dt: number, current: IBaseGameState, next: IBaseGameState,
                               reason: IDeltaReason, nextReason: IDeltaReason): void {
        // method exposed for inheriting classes
    }

    /**
     * Invoked when the first game state is ready to setup the dimensions of the renderer
     * @param state the initialize state of the game
     * @returns the {height, width} you for the game's size.
     */
    protected getSize(state: IBaseGameState): IRendererSize {
        // intended to be inherited and returned with useful numbers
        return {width: 10, height: 10};
    }

    /**
     * Starts the game, basically like init, but after other stuff is ready
     * (like loading textures).
     * @param state the initial state of the game
     */
    protected start(state: IBaseGameState): void {
        // intended to be inherited
    }

    /**
     * Creates settings for a game, given some base settings,
     * this injects the player colors and returns them as ready to use settings.
     * @param settings the game's specific settings to setup
     * @returns the game's settings extended with things!
     */
    protected createSettings<T extends {}>(settings: T): Readonly<T & IBaseGameSettings> {
        // Because other game's settings may have changed the BaseSetting.index, we need to reset it here
        // So, find the greatest index of the settings we were passed, then add 1 to it because that is the next
        //     new index to use below when we add color settings
        Settings.BaseSetting.newIndex = Object.keys(settings).reduce(
            (max, key) => Math.max(max, (settings as any)[key].index),
            -1,
        ) + 1;

        const combined = Object.assign({
            customPlayerColors: new Settings.CheckBoxSetting({
                id: "custom-player-colors",
                label: "Custom Player Colors",
                hint: "Use your custom player colors defined below.",
                default: false,
            }),
            playerColors: [] as Settings.ColorSetting[],
        }, settings);

        for (let i = 0; i < this.numberOfPlayers; i++) { // iterate in reverse order
            combined.playerColors[i] = new Settings.ColorSetting({
                id: `player-color-${i}`,
                label: `Player ${i} Color`,
                hint: "Overrides the color for Player " + i,
                default: this.defaultPlayerColors[i].hex(),
            });
        }

        return Settings.createSettings(this.name, combined) as any;
    }

    /**
     * Creates a layer for the game, the order this is called is the order they
     * are layered, so call the top layer last.
     * @returns the new layer
     */
    protected createLayer(): PIXI.Container {
        const container = new PIXI.Container();
        this.layerOrder.push(container);
        return container;
    }

    /**
     * Creates layers for a game and adds them to the renderer
     * @param layers the layers in the game
     * @returns the layers, now frozen
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

        this.pane = new this.namespace.Pane(this.viseur, this, this.next || this.current!);
        this.pane.update(this.current || this.next!, this.next);

        if (this.humanPlayer && this.humanPlayerID) {
            this.humanPlayer.setPlayer(this.gameObjects[this.humanPlayerID]);
            this.pane.setHumanPlayer(this.humanPlayerID);
        }

        // attach callbacks to recolor this game  whenever a color setting changes
        const recolor = () => this.recolor();
        this.settings.customPlayerColors.changed.on(recolor);
        for (const playerColorSetting of this.settings.playerColors) {
            playerColorSetting.changed.on(recolor);
        }

        const size = this.getSize(this.current || this.next!);
        this.renderer.setSize(size);
        this.start(this.current || this.next!);
        this.createBackground(this.current || this.next!);
    }

    /**
     * find game object references, and hooks them up in an object
     * @param obj - object to search through and clone, hooking up game object references
     * @returns a new object, with no game object references
     */
    private hookupGameObjectReferences(obj: any): any {
        if (typeof(obj) !== "object" || !obj) {
            return obj;
        }

        if (typeof(obj) === "object" && Object.hasOwnProperty.call(obj, "id")) { // it's a game object reference
            return this.gameObjects[obj.id];
        }

        const cloned: any = {};
        for (const key of Object.keys(obj)) {
            cloned[key] = this.hookupGameObjectReferences(obj[key]);
        }

        return cloned;
    }

    /**
     * initializes a new game object with the given id
     * @param id - the id of the game object to initialize
     * @param state - the initial state of the new game object
     * @returns The newly created game object.
     */
    private createGameObject(id: string, state: IBaseGameObjectState): BaseGameObject {
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
            // it's a player instance, no easy way to cast that here as there is
            // no BasePlayer class, only the compile time interface
            ((newGameObject as any) as IBasePlayer).playersIndex = this.players.length;
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
