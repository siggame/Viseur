import * as $ from "jquery";
import * as queryString from "query-string";
import { Event } from "src/core/event";
import { Games } from "src/games";
import * as utils from "src/utils";
import { BaseGame } from "./game/base-game";
import { IDelta, IDeltaReason, IGamelog } from "./game/gamelog";
import { IBaseGameNamespace, IBaseGameState } from "./game/interfaces";
import { GUI } from "./gui";
import { Joueur, TournamentClient } from "./joueur";
import { Parser } from "./parser";
import { Renderer } from "./renderer";
import { ViseurSettings } from "./settings";
import { ICurrentTime, TimeManager } from "./time-manager";

export interface IViseurGameState {
    game?: IBaseGameState;
    nextGame?: IBaseGameState;
    reason?: IDeltaReason;
    nextReason?: IDeltaReason;
}

export interface IReverseDelta extends IDelta {
    /** A delta that goes BACKWARDs in state when merged */
    reversed?: IBaseGameState;
}

export interface IGamelogWithReverses extends IGamelog {
    /** List of deltas with their reverses as options */
    deltas: IReverseDelta[];
}

/**
 * The container for merged deltas. We only store 2 states as they get HUGE,
 * and if we stored every merged delta storage space could run out.
 */
export interface IMergedDelta {
    index: number;
    currentState?: IBaseGameState;
    nextState?: IBaseGameState;
}

export class Viseur {
    /** The singleton instance of this class */
    private static singleton: Viseur;

    //// ---- public ---- \\\\

    /** The game we are rendering and handling input for */
    public game: BaseGame;

    /** The graphics user interface handler */
    public readonly gui: GUI;

    /** Manages the time for the current index and dt during playback */
    public readonly timeManager: TimeManager;

    /** The renderer that handles textures and base rendering for the visualizer */
    public readonly renderer: Renderer;

    /** Manages all the global (viseur), non-game, related settings */
    public readonly settings = ViseurSettings;

    /** The gamelog */
    public gamelog?: IGamelog;

    /** The gamelog in its unparsed json form */
    public unparsedGamelog?: string;

    /** The raw gamelog */
    public rawGamelog?: IGamelogWithReverses;

    /** All available game namespaces */
    public games: {[gameName: string]: IBaseGameNamespace} = Games;

    // Events \\

    public readonly events = Object.freeze({
        /** Triggers when the game's state changes and sends the new state */
        stateChanged: new Event<IViseurGameState>(),

        /** Triggers when the timer ticks */
        timeUpdated: new Event<ICurrentTime>(),

        /** Triggers literally 1 second after the ready event */
        delayedReady: new Event<undefined>(),

        /** Triggers when all async events are done and we are ready to being normal operations */
        ready: new Event<{game: BaseGame, gamelog: IGamelog}>(),

        /** Triggered during loading of the gamelog if the gamelog is found at a remote url */
        gamelogIsRemote: new Event<{url?: string}>(),

        /** Triggered when the gamelog has been loaded */
        gamelogLoaded: new Event<IGamelog>(),

        /** Triggers when a steaming gamelog is updated in some way, probably a new delta */
        gamelogUpdated: new Event<IGamelog>(),

        /**
         * Triggers when a streaming gamelog is finished streaming and will no longer change.
         * In addition a url to the finalized gamelog (with other player's non obfuscated data) will be emitted
         */
        gamelogFinalized: new Event<{ gamelog: IGamelog, url: string }>(),

        // -- connection events -- \\

        /** Triggers when a connection event occurs and we have some message to send */
        connectionConnected: new Event<undefined>(),

        /** Triggers when a connection event occurs and we have some message to send */
        connectionMessage: new Event<string>(),

        /** Triggers when a connection that was opened is closed, including data if it closed due to a timeout */
        connectionClosed: new Event<{timedOut: boolean}>(),

        /** Triggers when a connection encounters and error, and emits that error */
        connectionError: new Event<Error>(),
    });

    //// ---- private ---- \\\\

    /** Parameters parsed from the URL parameters */
    private urlParameters: utils.IAnyObject;

    /** The gamelog parser */
    private parser: Parser;

    /** Our merged delta container */
    private mergedDelta: IMergedDelta;

    /** Our current merged game states and reasons */
    private currentState: IViseurGameState;

    /** The game client we will use when playing or spectating games */
    private joueur?: Joueur;

    /** The client to the tournament server */
    private tournamentClient?: TournamentClient;

    /** Indicates the textures loaded */
    private loadedTextures: boolean = false;

    constructor() {
        this.gui = new GUI({
            parent: $(document.body),
        });

        this.timeManager = new TimeManager();
        this.timeManager.events.newIndex.on((index: number) => {
            this.updateCurrentStateAsync(index);
        });

        this.renderer = new Renderer({
            parent: this.gui.rendererWrapper,
        });

        this.gui.events.resized.on((resized) => {
            this.renderer.resize(resized.width, resized.remainingHeight);
        });
        this.gui.resize();

        this.renderer.events.rendering.on(() => {
            if (this.game) {
                const time = this.timeManager.getCurrentTime();
                this.events.timeUpdated.emit(time);
                this.game.render(time.index, time.dt);
            }
        });

        this.parseURL();
    }

    /**
     * Gets the singleton instance of Viseur
     */
    public static get instance(): Viseur {
        if (!Viseur.singleton) {
            Viseur.singleton = new Viseur();
        }

        return Viseur.singleton;
    }

    /**
     * Returns the current state of the game
     * @returns {Object} the current state, which is a custom object containing
     *                   the current `game` state and the `nextGame` state.
     */
    public getCurrentState(): IViseurGameState {
        return this.currentState;
    }

    /**
     * Connects to a game server to spectate some game
     * @param {string} server - the server is running on (without port)
     * @param {number} port - the port the server is running on
     * @param {string} gameName - name of the game to spectate
     */
    public spectate(server: string, port: number, gameName: string): void {
        this.gui.modalMessage("Spectating game...");

        this.createJoueur(server, port, gameName, true);
    }

    /**
     * Starts up "arena" mode, which grabs gamelogs from a url, then plays, it,
     * then repeats
     * @param {String} url the url to start grabbing arena gamelog urls from
     * @param {boolean} presentationMode true if should auto fullscreen, false otherwise
     */
    public startArenaMode(url: string, presentationMode: boolean = false): void {
        if (utils.validateURL(url)) {
            this.urlParameters.arena = url;

            if (presentationMode) {
                // this way the url parm will be ?presentation, no value.
                // it's presence tell us we want it
                this.urlParameters.presentation = null;
            }
            else {
                delete this.urlParameters.presentation; // remove the key, meaning false
            }

            // this refreshes the page, as we want
            location.search = queryString.stringify(this.urlParameters);
        }
        else {
            this.gui.modalError("Invalid url for arena mode");
        }
    }

    /**
     * Connects to a game server to play a game for the human controlling this Viseur
     * @param {string} server the server is running on (without port)
     * @param {number} port the port the server is running on
     * @param {string} gameName the name of the game to spectate
     * @param {string} playerName the name of the [human] player
     */
    public playAsHuman(server: string, port: number, gameName: string, playerName: string): void {
        this.gui.modalMessage("Connecting to game server...");

        this.createJoueur(server, port, gameName, {
            playerName,
        });
    }

    /**
     * Checks if there is currently a human playing
     * @returns {boolean} true if there is a human player, false otherwise (including spectator mode)
     */
    public hasHumanPlaying(): boolean {
        return Boolean(this.game.humanPlayer);
    }

    /**
     * Runs some function the server for a game object
     * @param {string} callerID - the id of the caller
     * @param {string} functionName - the function to run
     * @param {Object} args - key value pairs for the function to run
     * @param {Function} callback - callback to invoke once run, is passed the return value
     */
    public runOnServer(
        callerID: string,
        functionName: string,
        args: utils.IAnyObject,
        callback: (returned: any) => void,
    ): void {
        if (!this.joueur) {
            throw new Error("No game client to run game logic for.");
        }

        this.joueur.run(callerID, functionName, args);

        if (callback) {
            this.joueur.events.ran.once(callback);
        }
    }

    /**
     * Connects to a tournament server to wait for play data to later connect as a human client
     * @param {string} server the server tournament server is running on (without port)
     * @param {number} port the port the server is running on
     * @param {string} playerName the name of the player in the tournament
     */
    public connectToTournament(server: string, port: number, playerName: string): void {
        this.doubleLog("Connecting to tournament server...");

        this.tournamentClient = new TournamentClient();

        this.tournamentClient.on("error", (err: any) => {
            this.gui.modalError(err);
        });

        this.tournamentClient.on("connected", () => {
            this.doubleLog("Connected to tournament server, awaiting game.");
        });

        this.tournamentClient.on("closed", () => {
            this.events.connectionMessage.emit("Connected to tournament server closed.");
        });

        this.tournamentClient.on("playing", () => {
            this.events.connectionMessage.emit(`Now playing ${this.game.name}`);
        });

        this.tournamentClient.on("message", (message: string) => {
            this.events.connectionMessage.emit(`Message from tournament server: '${message}'`);
        });

        this.tournamentClient.connect(server, port, playerName);
    }

    /**
     * Handle an uncaught error, if this gets hit something BAD happened
     * @param {Error} error - the uncaught error
     */
    public handleError(error: Error): void {
        if (this.gui) {
            this.gui.modalError(`Uncaught Error: ${error}`);
        }
    }

    /**
     * parses URL parameters and does whatever they do, ignores unknown url parameters.
     */
    private parseURL(): void {
        this.urlParameters = queryString.parse(location.search);

        // set Settings via url parameters if they are valid
        for (const key of Object.keys(this.urlParameters)) {
            const setting = (this.settings as any)[key];
            if (setting) {
                setting.set(utils.unstringify(this.urlParameters[key]));
            }
        }

        // check if the gamelog url is remote
        const logUrl: string = this.urlParameters.log
                            || this.urlParameters.logUrl
                            || this.urlParameters.logURL;
        if (logUrl) {
            this.loadRemoteGamelog(logUrl);
        }
        else if (this.urlParameters.arena) { // then we are in arena mode
            this.gui.modalMessage("Requesting next gamelog from Arena...");
            $.ajax({
                dataType: "text",
                url: this.urlParameters.arena,
                crossDomain: true,
                success: (gamelogURL: string) => {
                    const presentationMode = Object.hasOwnProperty.call(this.urlParameters, "presentation");
                    if (presentationMode) {
                        this.gui.goFullscreen();
                    }

                    // load the gamelog (modal should be fullscreen)
                    this.loadRemoteGamelog(gamelogURL);

                    if (presentationMode) {
                        this.events.delayedReady.on(() => {
                            this.timeManager.play();
                        });
                    }
                },
                error: () => {
                    this.gui.modalError("Error loading gamelog url from arena.");
                },
            });

            // When we finish playback (the timer reaches its end), wait 5 seconds
            //  then reload the window (which will grab a new gamelog and do all this again)
            this.timeManager.events.ended.on(() => {
                setTimeout(() => {
                    location.reload();
                }, 5000);
            });
        }
    }

    /**
     * Does an ajax call to load a remote gamelog at some url
     * @param {string} url a url that will respond with the gamelog to load
     */
    private loadRemoteGamelog(url: string): void {
        this.gui.modalMessage("Loading remote gamelog");
        this.events.gamelogIsRemote.emit({url});

        $.ajax({
            url,
            dataType: "text",
            crossDomain: true,
            success: (jsonGamelog: string) => {
                this.gui.modalMessage("Initializing Visualizer.");
                this.parseGamelog(jsonGamelog);
            },
            error: () => {
                this.gui.modalError("Error loading remote gamelog.");
            },
        });
    }

    /**
     * Parses a json string to a gamelog
     * @param {string} jsonGamelog the json formatted string that is the gamelog
     */
    private parseGamelog(jsonGamelog: string): void {
        this.unparsedGamelog = jsonGamelog;

        let parsed: IGamelog;
        try {
            parsed = JSON.parse(jsonGamelog);
        }
        catch (err) {
            this.gui.modalError("Error parsing gamelog - Does not appear to be valid JSON");
            return;
        }

        this.gamelogLoaded(parsed);
    }

    /**
     * Called once a gamelog is loaded
     * @param {Object} gamelog the deserialized JSON object that is the FULL gamelog
     */
    private gamelogLoaded(gamelog: IGamelog): void {
        this.rawGamelog = gamelog;
        this.parser = new Parser(gamelog.constants);

        if (!gamelog.streaming) {
            this.events.gamelogLoaded.emit(gamelog);
        }
        // else we didn't "load" the gamelog, and thus it's streaming to us

        // we keep the current and next state here, fully merged with all game information.
        const delta = gamelog.deltas[0];
        this.mergedDelta = {
            index: -1,
            currentState: undefined,
            // clone the current game state into an empty object
            nextState: this.parser.mergeDelta({} as any, delta.game),
        };

        if (!this.joueur && gamelog.deltas.length > 0) {
            this.createGame(gamelog.gameName);
        }
    }

    /**
     * Initializes the Game object for the specified gameName.
     * The class created will be the one in src/games/{gameName}/game.js
     * @param {string} gameName - name of the game to initialize. Must be a valid game name, or throws an error
     * @param {string} [playerID] - id of the player if this game has a human player
     */
    private createGame(gameName: string, playerID?: string): void {
        const gameNamespace = this.games[gameName];

        if (!gameNamespace) {
            throw new Error(`Cannot load data for game '${gameName}'.`);
        }

        if (this.game) {
            throw new Error(`Viseur game already initialized`);
        }

        if (!this.joueur) {
            this.updateCurrentState(0); // create the initial states
            this.timeManager.setTime(0, 0);
        }

        this.game = new gameNamespace.Game(this.rawGamelog, playerID);

        // preload all textures
        this.renderer.loadTextures(() => {
            this.loadedTextures = true;
            this.checkIfReady();
        });
    }

    /**
     * Invokes updateCurrentState asynchronously if it may take a long time, so the gui can update
     * @param {number} index - the new states index, must be between [0, deltas.length]
     */
    private updateCurrentStateAsync(index: number): void {
        if (Math.abs(index - this.mergedDelta.index) > 25) {
            // it will take a long time to load, so display a loading modal
            this.gui.modalMessage("Loading game state...", () => {
                this.updateCurrentState(index);
                this.gui.hideModal();
            });
        }
        else { // just do it synchronously
            this.updateCurrentState(index);
        }
    }

    /**
     * Brings the current state & next state to the one at the specified index.
     * If the current and passed in indexes are far apart this operation can
     * take a decent chunk of time...
     * @param {number} index the new states index, must be between [0, deltas.length]
     */
    private updateCurrentState(index: number): void {
        if (!this.rawGamelog) {
            throw new Error("cannot update current state deltas without a gamelog");
        }

        const d = this.mergedDelta;
        const deltas = this.rawGamelog.deltas;

        if (index < 0) {
            this.currentState = {
                game: d.currentState,
                nextGame: d.nextState,
                reason: undefined,
                nextReason: this.deltaToReason(deltas[0]),
            } as any;

            return;
        }

        const indexChanged = (index !== d.index);
        d.currentState = (d.currentState || {}) as any;

        // if increasing index...
        while (index > d.index) {
            d.index++;

            if (deltas[d.index] && !deltas[d.index].reversed) {
                deltas[d.index].reversed = this.parser.createReverseDelta(d.currentState, deltas[d.index].game);
            }

            if (d.nextState && deltas[d.index] && deltas[d.index + 1] && !deltas[d.index + 1].reversed) {
                deltas[d.index + 1].reversed = this.parser.createReverseDelta(d.nextState, deltas[d.index + 1].game);
            }

            if (deltas[d.index]) {
                d.currentState = this.parser.mergeDelta(d.currentState as any, deltas[d.index].game);
            }

            if (d.nextState && deltas[d.index + 1]) { // if there is a next state (not at the end)
                d.nextState = this.parser.mergeDelta(d.nextState, deltas[d.index + 1].game);
            }
        }

        // if decreasing index...
        while (index < d.index) {
            const r = deltas[d.index] && deltas[d.index].reversed;
            const r2 = d.nextState && deltas[d.index + 1] && deltas[d.index + 1].reversed;

            if (r) {
                d.currentState = this.parser.mergeDelta(d.currentState as any, r);
            }

            if (r2) {
                if (deltas[d.index + 1]) { // if there is a next state (not at the end)
                    d.nextState = this.parser.mergeDelta(d.nextState as any, r2);
                }
            }

            d.index--;
        }

        const delta = deltas[d.index];
        const nextDelta = deltas[d.index + 1];
        if (indexChanged) {
            this.currentState = Object.assign({}, delta, {
                game: d.currentState,
                nextGame: d.nextState,
                reason: this.deltaToReason(delta),
                nextReason: this.deltaToReason(nextDelta),
            });

            this.events.stateChanged.emit(this.currentState);
        }
    }

    /**
     * Formats a delta to a simpler delta reason structure
     *
     * @param {Object} delta - raw delta from the gamelog to format
     * @returns {Object|null} the type of delta and it's data in one object, null if no delta
     */
    private deltaToReason(delta: IReverseDelta): IReverseDelta | undefined {
        if (delta) {
            return Object.assign({
                type: delta.type,
            }, delta.data || {}) as any;
        }

        return undefined;
    }

    /**
     * Called when Viseur thinks it is ready, meaning the renderer has
     * downloaded all assets, the gamelog is loaded, and the game class as been
     * initialized.
     */
    private checkIfReady(): void {
        if (this.loadedTextures && (!this.joueur || this.joueur.hasStarted())) {
            // then we are ready to start
            this.gui.hideModal();
            this.events.ready.emit({
                game: this.game,
                gamelog: this.rawGamelog as IGamelog,
            });

            // HACK: wait 1 second, then resize the gui because the panel
            //       sometimes (seemingly randomly) is the wrong height
            setTimeout(() => {
                this.gui.resize();
                this.events.delayedReady.emit(undefined); // ready but delayed so we are super ready (arena mode play)
            }, 1000);
        }
    }

    /**
     * Logs a string to the modal and connection tab
     * @param {string} message the string to log
     */
    private doubleLog(message: string): void {
        this.gui.modalMessage(message);
        this.events.connectionMessage.emit(message);
    }

    /**
     * Initializes the Joueur (game client)
     * @param {String} server the game server address
     * @param {Number} port the port for server
     * @param {String} gameName the name of the game to connect to (id)
     * @param {Object} options any optional parameters for the game session
     */
    private createJoueur(server: string, port: number, gameName: string, options: {}): void {
        this.joueur = new Joueur();

        this.rawGamelog = this.joueur.getGamelog();

        this.joueur.events.connected.on(() => {
            this.gui.modalMessage("Awaiting game to start...");

            this.events.connectionConnected.emit(undefined);
        });

        // TODO: ILobbiedData Interface
        let lobbiedData: any;
        this.joueur.events.lobbied.on((data) => {
            lobbiedData = data;
            this.gui.modalMessage(`In lobby '${data.gameSession}' for '${data.gameName}'. Waiting for game to start.`);
        });

        this.joueur.events.start.on(() => {
            if (!this.joueur) {
                throw new Error("Joueur client destroyed before game started");
            }

            this.createGame(lobbiedData.gameName, this.joueur.getPlayerID());
            this.checkIfReady();
        });

        this.joueur.events.error.on((err) => {
            this.gui.modalError("Connection error");
            this.events.connectionError.emit(err);
        });

        this.joueur.events.closed.on((data) => {
            this.events.connectionClosed.emit(data);
        });

        this.joueur.events.delta.on(() => {
            if (this.rawGamelog && this.rawGamelog.deltas.length === 1) {
                this.gamelogLoaded(this.rawGamelog);
            }

            this.events.gamelogUpdated.emit(this.rawGamelog as any);
        });

        // TODO: IOverData
        this.joueur.events.over.on((data) => {
            this.events.gamelogFinalized.emit({
                gamelog: this.rawGamelog as IGamelog,
                url: data.gamelogURL,
            });
        });

        // TODO: IFatalData
        this.joueur.events.fatal.on((data) => {
            this.gui.modalError("Fatal game server event: " + data.message);
        });
    }
}

export const viseur: Viseur = Viseur.instance;
