import { EventEmitter } from "events";
import { IAnyObject } from "src/utils";
import { viseur } from "src/viseur";
import { IGamelog } from "src/viseur/game/gamelog";
import * as serializer from "./serializer";

/* tslint:disable:unified-signatures */
export interface IJoueurEvents {
    /** Emitted whenever the underlying web socket connection errors */
    on(event: "error", listener: (error: any) => void): this;

    /** Emitted once this initially connects to the tournament server */
    on(event: "connected", listener: () => void): this;

    /** Emitted once the connection is closed */
    on(event: "closed", listener: (timedOut: boolean) => void): this;

    /** Emitted any any event occurs */
    on(event: "event", listener: (event: string, data: any) => void): this;
}
/* tslint:enable:unified-signatures */

/**
 * The websocket client to a game server.
 * Handles i/o with the game server, and mostly merges delta states from it.
 */
export class Joueur extends EventEmitter implements IJoueurEvents {
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
    private socket: WebSocket;

    /** True if the closed connection did so because we timed out connecting to them */
    private timedOut: boolean;

    /** The player's id of our player */
    private playerID?: string;

    /** True when the game has started, false otherwise */
    private started: boolean = false;

    /**
     * Gets the gamelog this client is streaming
     * @returns the current gamelog, but it will probably be incomplete
     */
    public getGamelog(): IGamelog {
        return this.gamelog;
    }

    /**
     * Connects to some game server
     * @param {string} gameName the game to connect to and play
     * @param {string} [server=localhost] the location of the server
     * @param {number} [port=3088] the port at which the server is listening for websocket clients
     * @param {Object} [spectating] the optional arguments to send to the game server
     * @param {string} [session] the name of the session to play in
     * @param {string} [playerName] the name of our player
     */
    public connect(
        gameName: string,
        server: string = "localhost",
        port: number = 3088,
        spectating: boolean = false,
        session: string = "new",
        playerName: string = "Human",
    ): void {
        this.gamelog.gameName = gameName;

        try {
            this.socket = new WebSocket("ws://" + server + ":" + port);
        }
        catch (err) {
            this.emit("error", err);
        }

        this.socket.onopen = () => {
            this.emit("connected");

            this.send("play", {
                gameName,
                spectating,
                playerName,
                clientType: "Human",
                metaDeltas: true,
                requestedSession: session,
            });
        };

        this.socket.onerror = (err) => {
            this.emit("error", err);
        };

        this.socket.onmessage = (message) => {
            if (viseur.settings.printIO.get()) {
                // tslint:disable-next-line:no-console
                console.log("FROM SERVER <-- ", message.data);
            }

            this.received(JSON.parse(message.data));
        };

        this.socket.onclose = () => {
            this.emit("closed", Boolean(this.timedOut));
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

        switch (eventName) {
            case "over":
                this.autoHandleOver();
                break;
            case "start":
                this.autoHandleStart(data);
                break;
            case "lobbied":
                this.autoHandleLobbied(data);
                break;
            case "delta":
                this.autoHandleDelta(data);
                break;
            case "order":
                this.autoHandleOrder(data);
                break;
            case "fatal":
                this.autoHandleFatal(data);
                break;
            default:
                throw new Error(`Could not find an auto handler for event ${data.event}`);
        }

        this.emit("event", eventName, data.data);
    }

    /**
     * Invoked automatically to handle the 'over' events
     * @param {Object} data the game over data
     */
    private autoHandleOver(): void {
        this.gamelog.streaming = false;
        this.playerID = undefined;
        this.socket.close();
    }

    /**
     * Invoked automatically to handle the 'over' events
     * @param {Object} data the start data, such as playerID, gameName
     */
    private autoHandleStart(data: any): void {
        this.playerID = data.playerID;
        this.started = true;
    }

    /**
     * Invoked automatically to handle the 'lobbied' events
     * @param {Object} data - data about what game session this client is lobbied in, such as 'session' and 'gameName'
     */
    private autoHandleLobbied(data: any): void {
        this.gamelog.gameName = data.gameName;
        this.gamelog.gameSession = data.gameSession;
        this.gamelog.constants = data.constants;
    }

    /**
     * Invoked automatically to handle the 'delta' events
     *
     * @param {Object} data - a meta delta (complete delta, with reasons why it occurred) about what changed in the game
     */
    private autoHandleDelta(data: any): void {
        this.gamelog.deltas.push(data);
    }

    /**
     * Invoked to make the AI do some order
     *
     * @param {Object} data the order details
     */
    private autoHandleOrder(data: any): void {
        const args = serializer.deserialize(data.args);
        viseur.game.humanPlayer.order({
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

        if (viseur.settings.printIO.get()) {
            // tslint:disable-next-line:no-console
            console.log("TO SERVER --> ", str);
        }

        this.socket.send(str);
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

        throw new Error(`An unexpected fatal error occurred on the game server: '${data.message}'`);
    }
}
