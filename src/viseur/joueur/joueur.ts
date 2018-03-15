import { IAnyObject } from "src/utils";
import { Viseur } from "src/viseur";
import { IDelta, IGamelog, IGameServerConstants } from "src/viseur/game/gamelog";
import { Event, events } from "ts-typed-events";
import * as serializer from "./serializer";

export interface IJoueurConnectionArgs {
    /** The name of the game to connect to */
    gameName: string;

    /** The server address */
    server: string;

    /** The port to connect through */
    port: number;

    /** The session to connect to */
    session: string;

    /** If we are spectating or now */
    spectating?: boolean;

    /** The name of our player */
    playerName?: string;

    /** Server-side game settings */
    gameSettings?: string;
}

/**
 * The websocket client to a game server.
 * Handles i/o with the game server, and mostly merges delta states from it.
 */
export class Joueur {
    public readonly events = events({
        error: new Event<Error>(),

        /** Emitted once this initially connects to the tournament server */
        connected: new Event(),

        /** Emitted once the connection is closed */
        closed: new Event<{timedOut: boolean}>(),

        /** Emitted when we are lobbied by the game server */
        lobbied: new Event<{gameSession: string, gameName: string, constants: IGameServerConstants}>(),

        /** Emitted when the game on the game server starts */
        start: new Event<{playerID: string}>(),

        /** Emitted when a change in game state (delta) is sent from the game server */
        delta: new Event<IDelta>(),

        /** Emitted by the game server after it runs something for us */
        ran: new Event<any>(),

        /** Emitted when the game is over */
        over: new Event<{gamelogURL: string, visualizerURL: string, message: string}>(),

        /** Emitted when a fatal event is sent from the server */
        fatal: new Event<{message: string}>(),
    });

    /**
     * Our "gamelog" we are creating on the fly (streaming)
     * All values are junk values until we get more information from the
     * game server
     */
    private readonly gamelog: IGamelog = {
        constants: {DELTA_LIST_LENGTH: "", DELTA_REMOVED: ""},
        deltas: [],
        epoch: 0,
        gameName: "",
        gameSession: "",
        losers: [],
        randomSeed: "",
        streaming: true,
        winners: [],
    };

    /** The web socket connection we use to talk to the game server */
    private socket: WebSocket | undefined;

    /** True if the closed connection did so because we timed out connecting to them */
    private timedOut: boolean = false;

    /** The player's id of our player */
    private playerID?: string;

    /** True when the game has started, false otherwise */
    private started: boolean = false;

    public constructor(
        /** The Viseur instance that controls everything */
        private readonly viseur: Viseur,
    ) {}

    /**
     * Gets the gamelog this client is streaming
     * @returns the current gamelog, but it will probably be incomplete
     */
    public getGamelog(): IGamelog {
        return this.gamelog;
    }

    /**
     * Connects to some game server
     * @param args the connection arguments
     */
    public connect(args: IJoueurConnectionArgs): void {
        this.gamelog.gameName = args.gameName;

        try {
            this.socket = new WebSocket(`ws://${args.server}:${args.port}`);
        }
        catch (err) {
            this.events.error.emit(err);
            return;
        }

        this.socket.onopen = () => {
            this.events.connected.emit(undefined);

            this.send("play", {
                gameName: args.gameName,
                spectating: args.spectating || false,
                playerName: args.playerName || "Human Player",
                clientType: "Human",
                metaDeltas: true,
                requestedSession: args.session,
                gameSettings: args.gameSettings,
            });
        };

        this.socket.onerror = (err) => {
            this.events.error.emit(new Error(err.type));
        };

        this.socket.onmessage = (message) => {
            if (this.viseur.settings.printIO.get()) {
                // tslint:disable-next-line:no-console
                console.log("FROM SERVER <-- ", message.data);
            }

            this.received(JSON.parse(message.data));
        };

        this.socket.onclose = () => {
            this.events.closed.emit({timedOut: this.timedOut});
        };
    }

    /**
     * Checks if the Joueur has recorded that the game has started
     * @returns {boolean} true if started, false otherwise
     */
    public hasStarted(): boolean {
        return this.started;
    }

    /**
     * Gets the ID of the Player this Joueur can send commands for
     * @returns {string|undefined} undefined if not playing, otherwise the id of the player
     */
    public getPlayerID(): string | undefined {
        return this.playerID;
    }

    /**
     * Runs some function the server for a game object
     * @param {string} callerID the id of the caller
     * @param {string} functionName the function to run
     * @param {Object} args the key value pairs for the function to run
     */
    public run(callerID: string, functionName: string, args: IAnyObject): void {
        this.send("run", {
            caller: {id: callerID},
            functionName,
            args: serializer.serialize(args),
        });
    }

    /**
     * Invoked when we receive some data from the websocket
     *
     * @param {Object} data - game server interchange formatted data
     */
    private received(data: any): void {
        const eventName = (data.event as string).toLowerCase();

        const orderData = data.data;
        switch (eventName) {
            case "over":
                this.autoHandleOver(orderData);
                break;
            case "start":
                this.autoHandleStart(orderData);
                break;
            case "lobbied":
                this.autoHandleLobbied(orderData);
                break;
            case "delta":
                this.autoHandleDelta(orderData);
                break;
            case "order":
                this.autoHandleOrder(orderData);
                break;
            case "ran":
                this.events.ran.emit(orderData);
                break;
            case "fatal":
                this.autoHandleFatal(orderData);
                break;
            default:
                throw new Error(`Could not find an auto handler for event ${data.event}`);
        }
    }

    /**
     * Invoked automatically to handle the 'over' events
     * @param {Object} data the game over data
     */
    private autoHandleOver(data: any): void {
        this.gamelog.streaming = false;
        this.playerID = undefined;
        this.events.over.emit(data);
        if (this.socket) {
            this.socket.close();
        }
    }

    /**
     * Invoked automatically to handle the 'over' events
     * @param {Object} data the start data, such as playerID, gameName
     */
    private autoHandleStart(data: any): void {
        this.playerID = data.playerID;
        this.started = true;
        this.events.start.emit(data.playerID);
    }

    /**
     * Invoked automatically to handle the 'lobbied' events
     * @param {Object} data - data about what game session this client is lobbied in, such as 'session' and 'gameName'
     */
    private autoHandleLobbied(data: any): void {
        this.gamelog.gameName = data.gameName;
        this.gamelog.gameSession = data.gameSession;
        this.gamelog.constants = data.constants;
        this.events.lobbied.emit(data);
    }

    /**
     * Invoked automatically to handle the 'delta' events
     *
     * @param {Object} data - a meta delta (complete delta, with reasons why it occurred) about what changed in the game
     */
    private autoHandleDelta(data: any): void {
        this.gamelog.deltas.push(data);
        this.events.delta.emit(data);
    }

    /**
     * Invoked to make the AI do some order
     *
     * @param {Object} data the order details
     */
    private autoHandleOrder(data: any): void {
        const args = serializer.deserialize(data.args);
        // if we have an order to handle, then we must have a game
        this.viseur.game!.humanPlayer!.order({
            name: data.name as string,
            args: args as any[],
            callback: (returned: any) => {
                setTimeout(() => {
                    this.send("finished", {
                        orderIndex: data.index,
                        returned,
                    });
                }, 50); // delay before sending over, no idea why this is needed
            },
        });
    }

    /**
     * Invoked automatically to handle the 'fatal' events
     * @param {Object} data the fatal information as to what happened
     */
    private autoHandleFatal(data: any): void {
        if (data.timedOut) {
            this.timedOut = true;
            return; // our human player's fault, so this error is expected
                    // and not really an error. Immediately following this we
                    // should get a delta saying they lost to display
        }

        const err = new Error(`An unexpected fatal error occurred on the game server: '${data.message}'`);
        this.events.error.emit(err);
        throw err;
    }

    /**
     * Sends some event to the game server game server connected to
     * @param {string} eventName the name of the event, should be something game server expects
     * @param {*} [data] the additional data about the event
     */
    private send(eventName: string, data: any): void {
        // NOTE: this does not serialize game objects
        //       so don't be sending cycles like other joueur clients
        const str = JSON.stringify({
            event: eventName,
            sentTime: (new Date()).getTime(),
            data,
        });

        if (this.viseur.settings.printIO.get()) {
            // tslint:disable-next-line:no-console
            console.log("TO SERVER --> ", str);
        }

        this.socket!.send(str);
    }
}
