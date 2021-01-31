import { FirstArgument, Immutable, isObject } from "src/utils";
import { Viseur } from "src/viseur";
import { createEventEmitter } from "ts-typed-events";

/** Data sent from the Tournament server detailing how to connect to play. */
export interface TournamentPlayData {
    /** The server to connect to. */
    server: string;
    /** The port to connect through. */
    port: number;
    /** The name of the game to play. */
    game: string;
    /** The name of the player. */
    playerName: string;
    /** The session to play in. */
    session: string;
}

/** The connection arguments for a tournament to connect. */
export type TournamentConnectionArgs = FirstArgument<
    TournamentClient["connect"]
>;

/** A WS connection to a tournament server. */
export class TournamentClient {
    /** Emitter for the Error event. */
    private emitError = createEventEmitter<Error>();
    /** Emitted when an error is encountered by the socket. */
    public eventError = this.emitError.event;

    /** Emitter for the Connected event. */
    private emitConnected = createEventEmitter();
    /** Emitted once this initially connects to the tournament server. */
    public eventConnected = this.emitConnected.event;

    /** Emitter for the Closed event. */
    private emitClosed = createEventEmitter();
    /** Emitted once the connection is closed. */
    public eventClosed = this.emitClosed.event;

    /** Emitter for the Messaged event. */
    private emitMessaged = createEventEmitter<string>();
    /** Emitted any time the tournament server sends a message. */
    public eventMessaged = this.emitMessaged.event;

    /** Emitter for the Playing event. */
    private emitPlaying = createEventEmitter<TournamentPlayData>();
    /**
     * Emitted once we are told that we are playing a game,
     * includes details on how to play that game.
     */
    public eventPlaying = this.emitPlaying.event;

    /** True when connected to the tournament server, false otherwise. */
    public connected = false;

    /** The web socket connection we'll use to talk to the Tournament server. */
    private socket: WebSocket | undefined;

    /**
     * Creates a Tournament Client.
     *
     * @param viseur - The Viseur instance this is in.
     */
    public constructor(
        /** The Viseur instance that controls everything. */
        private readonly viseur: Viseur,
    ) {}

    /**
     * Connects to a remote tournament server.
     *
     * @param args - The connection args.
     * These are exactly as the one on the tournament server.
     */
    public connect(
        args: Immutable<{
            /** The server address/ip to connect to. */
            server: string;

            /** The port to connect to on the server. */
            port: number;

            /** The name of the player connecting. */
            playerName?: string;
        }>,
    ): void {
        try {
            this.socket = new WebSocket(`ws://${args.server}:${args.port}`);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(err);
            this.emitError(error);

            return;
        }

        this.socket.onopen = () => {
            this.connected = true;
            this.emitConnected();

            this.send("register", {
                type: "Viseur",
                name: args.playerName || "Human Player",
                password: "ReplaceMe", // yes, "ReplaceMe" is the correct value
            });
        };

        this.socket.onerror = (err) => {
            this.emitError(new Error(err.type));
        };

        this.socket.onmessage = (message) => {
            if (this.viseur.settings.printIO.get()) {
                // eslint-disable-next-line no-console
                console.log("FROM TOURNAMENT <-- ", message.data);
            }

            const data = JSON.parse(message.data as string) as unknown;
            if (!isObject(data)) {
                throw new Error("Received non object from tournament server.");
            }

            this.received(data as FirstArgument<TournamentClient["received"]>);
        };

        this.socket.onclose = () => {
            this.emitClosed();
        };
    }

    /**
     * Force closes the websocket connection.
     */
    public close(): void {
        if (this.socket) {
            this.socket.close();
        }
    }

    /**
     * Sends an event to the server.
     *
     * @param eventName - The name of the event.
     * @param data - The data about the event.
     */
    private send(eventName: string, data: unknown): void {
        if (!this.socket) {
            throw new Error(
                "Tournament Client tried to send before connected",
            );
        }
        const str = JSON.stringify({
            event: eventName,
            data,
        });

        if (this.viseur.settings.printIO.get()) {
            // eslint-disable-next-line no-console
            console.log("TO TOURNAMENT --> ", str);
        }

        this.socket.send(str);
    }

    /**
     * Invoked when we receive some data from the server.
     *
     * @param data - The data received from the server.
     * @param data.event - The event name.
     * @param data.data - The data about the event.
     */
    private received(data: {
        /** The event name. */
        event: string;
        /** The data about the event. */
        data?: unknown;
    }): void {
        switch (data.event) {
            case "message":
                this.onMessage(String(data.data));
                break;
            case "play":
                // TODO: verify this implements said interface.
                this.onPlay(data.data as TournamentPlayData);
                break;
            default:
                throw new Error(`Unexpected tournament event ${data.event}`);
        }
    }

    // --- On Received Callbacks --- \\

    /**
     * Invoked on a 'message' event.
     *
     * @param data - The message sent from the server.
     */
    private onMessage(data: string): void {
        this.emitMessaged(data);
    }

    /**
     * Invoked on a 'play' event.
     *
     * @param data - The data on what game server to connect to for bridging
     * the human playable connection.
     */
    private onPlay(data: Immutable<TournamentPlayData>): void {
        this.emitPlaying(data);

        const { game, ...args } = data;
        this.viseur.playAsHuman({
            gameName: game,
            ...args,
        });
    }
}
