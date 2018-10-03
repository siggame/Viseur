import { ClientEvent, IGamelog, ServerEvent } from "cadre-ts-utils/cadre";
import * as ServerEvents from "cadre-ts-utils/cadre/events/server";
import { FirstArgument, Immutable, UnknownObject } from "src/utils";
import { Viseur } from "src/viseur";
import { IViseurGamelog } from "src/viseur/game";
import { Event, events, Signal } from "ts-typed-events";
import * as serializer from "./serializer";

// handy types to access the "data" property of our events
type FatalData = Readonly<ServerEvents.FatalEvent["data"]>;
type LobbiedData = Readonly<ServerEvents.LobbiedEvent["data"]>;
type MetaDeltaData = Readonly<ServerEvents.MetaDeltaEvent["data"]>;
type OrderData = Readonly<ServerEvents.OrderEvent["data"]>;
type OverData = Readonly<ServerEvents.OverEvent["data"]>;
type RanData = Readonly<ServerEvents.RanEvent["data"]>;
type StartData = Readonly<ServerEvents.StartEvent["data"]>;

/** Connection arguments for a Joueur connection. */
export type JoueurConnectionArgs = FirstArgument<Joueur["connect"]>;

/** Represents an order that the game server sends game clients */
export interface IOrder {
    /** The name of the function to execute for said order. */
    name: string;

    /** The arguments, in order, to the function name */
    args: ReadonlyArray<unknown>;

    /**
     * The callback that will send back the returned value as the first
     * parameter.
     */
    callback(returned: unknown): void;
}

/**
 * The websocket client to a game server.
 * Handles i/o with the game server, and mostly merges delta states from it.
 */
export class Joueur {
    public readonly events = events({
        error: new Event<Error>(),

        /** Emitted once this initially connects to the tournament server */
        connected: new Signal(),

        /** Emitted once the connection is closed */
        closed: new Event<{ timedOut: boolean }>(),

        /** Emitted when we are lobbied by the game server */
        lobbied: new Event<LobbiedData>(),

        /** Emitted when the game on the game server starts */
        start: new Event<StartData>(),

        /**
         * Emitted when a change in game state (delta) is sent from the game
         * server.
         */
        delta: new Event<MetaDeltaData>(),

        /** Emitted by the game server after it runs something for us */
        ran: new Event<RanData>(),

        /** Emitted when the game is over */
        over: new Event<OverData>(),

        /** Emitted when a fatal event is sent from the server */
        fatal: new Event<FatalData>(),
    });

    /**
     * Our "gamelog" we are creating on the fly (streaming)
     * All values are junk values until we get more information from the
     * game server
     */
    private readonly gamelog: IViseurGamelog = {
        constants: {DELTA_LIST_LENGTH: "", DELTA_REMOVED: ""},
        deltas: [],
        epoch: 0,
        gameName: "",
        gameSession: "",
        losers: [],
        streaming: true,
        settings: { randomSeed: "" },
        winners: [],
    };

    /** The web socket connection we use to talk to the game server */
    private socket: WebSocket | undefined;

    /**
     * True if the closed connection did so because we timed out connecting to
     * them
     */
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
     * Connects to some game server.
     *
     * @param args - The connection arguments.
     */
    public connect(args: Immutable<{
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
        /** The index of your player in the players array */
        playerIndex?: string | number;
        /** Server-side game settings */
        gameSettings?: string;
    }>): void {
        this.gamelog.gameName = args.gameName;

        try {
            this.socket = new WebSocket(`ws://${args.server}:${args.port}`);
        }
        catch (err) {
            this.events.error.emit(err);

            return;
        }

        this.socket.onopen = () => {
            this.events.connected.emit();

            this.send({
                event: "play",
                data: {
                    gameName: args.gameName,
                    spectating: args.spectating || false,
                    playerName: args.playerName || "Human Player",
                    clientType: "Human",
                    metaDeltas: true,
                    requestedSession: args.session,
                    playerIndex: args.playerIndex,
                    gameSettings: args.gameSettings,
                },
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
     * @returns true if started, false otherwise
     */
    public hasStarted(): boolean {
        return this.started;
    }

    /**
     * Gets the ID of the Player this Joueur can send commands for
     * @returns undefined if not playing, otherwise the id of the player
     */
    public getPlayerID(): string | undefined {
        return this.playerID;
    }

    /**
     * Runs some function the server for a game object
     * @param callerID the id of the caller
     * @param functionName the function to run
     * @param args the key value pairs for the function to run
     */
    public run(
        callerID: string,
        functionName: string,
        args: UnknownObject,
    ): void {
        this.send({
            event: "run",
            data: {
                caller: { id: callerID },
                functionName,
                args: serializer.serialize(args) as UnknownObject,
            },
        });
    }

    /**
     * Invoked when we receive some data from the websocket
     *
     * @param event - game server interchange formatted data
     */
    private received(event: Readonly<ServerEvent>): void {
        switch (event.event) {
            case "over":
                this.autoHandleOver(event.data);
                break;
            case "start":
                this.autoHandleStart(event.data);
                break;
            case "lobbied":
                this.autoHandleLobbied(event.data);
                break;
            case "meta-delta":
                this.autoHandleMetaDelta(event.data);
                break;
            case "order":
                this.autoHandleOrder(event.data);
                break;
            case "ran":
                this.events.ran.emit(Object.freeze(event.data));
                break;
            case "fatal":
                this.autoHandleFatal(event.data);
                break;
            default:
                throw new Error(`Could not find an auto handler for event ${event.event}`);
        }
    }

    /**
     * Invoked automatically to handle the 'over' events
     * @param over the game over data
     */
    private autoHandleOver(over: OverData): void {
        this.gamelog.streaming = false;
        this.playerID = undefined;
        this.events.over.emit(over);
        if (this.socket) {
            this.socket.close();
        }
    }

    /**
     * Invoked automatically to handle the 'over' events
     * @param start the start data, such as playerID, gameName
     */
    private autoHandleStart(start: StartData): void {
        this.playerID = start.playerID;
        this.started = true;
        this.events.start.emit(start);
    }

    /**
     * Invoked automatically to handle the 'lobbied' events
     * @param lobbied - Data about what game session this client is lobbied in,
     * such as 'session' and 'gameName'.
     */
    private autoHandleLobbied(lobbied: LobbiedData): void {
        this.gamelog.gameName = lobbied.gameName;
        this.gamelog.gameSession = lobbied.gameSession;
        this.gamelog.constants = lobbied.constants;
        this.events.lobbied.emit(lobbied);
    }

    /**
     * Invoked automatically to handle the 'delta' events
     *
     * @param delta - A meta delta (complete delta, with reasons why it
     * occurred) about what changed in the game.
     */
    private autoHandleMetaDelta(delta: MetaDeltaData): void {
        this.gamelog.deltas.push(delta);
        this.events.delta.emit(delta);
    }

    /**
     * Invoked to make the AI do some order.
     *
     * @param order - The order this clioent should execute.
     */
    private autoHandleOrder(order: OrderData): void {
        const args = serializer.deserialize(order.args) as Array<unknown>;
        const { name } = order;
        if (!this.viseur.game || !this.viseur.game.humanPlayer) {
            throw new Error(`Cannot execute order ${name} without a game or human!`);
        }
        // if we have an order to handle, then we must have a game
        this.viseur.game.humanPlayer.order({
            name,
            args,
            callback: (returned: unknown) => {
                setTimeout(() => {
                    this.send({
                        event: "finished",
                        data: { orderIndex: order.index, returned },
                    });
                }, 50); // delay before sending over, does not work otherwise!?
            },
        });
    }

    /**
     * Invoked automatically to handle the 'fatal' events.
     *
     * @param fatal - The fatal information as to what happened.
     */
    private autoHandleFatal(fatal: FatalData): void {
        if (fatal.timedOut) {
            this.timedOut = true;

            return; // Our human player's fault, so this error is expected
                    // and not really an error. Immediately following this we
                    // should get a delta saying they lost to display.
        }

        const err = new Error(`An unexpected fatal error occurred on the game server: '${fatal.message}'`);
        this.events.error.emit(err);
        throw err;
    }

    /**
     * Sends some event to the game server game server connected to.
     *
     * @param event - The event to send to the game server.
     */
    private send(event: Readonly<ClientEvent>): void {
        if (!this.socket) {
            throw new Error(`Tried to send ${event.event} before socket!`);
        }
        // NOTE: this does not serialize game objects,
        // so don't be sending cycles like other joueur clients
        const str = JSON.stringify({
            ...event,
            epoch: (new Date()).getTime(),
        });

        if (this.viseur.settings.printIO.get()) {
            // tslint:disable-next-line:no-console
            console.log("TO SERVER --> ", str);
        }

        this.socket.send(str);
    }
}
