import { viseur } from "src/viseur";
import { Event, events } from "ts-typed-events";

/** Data sent from the Tournament server detailing how to connect to play */
export interface ITournamentPlayData {
    /** The server to connect to */
    server: string;
    /** The port to connect through */
    port: number;
    /** The name of the game to play */
    game: string;
    /** The name of the player */
    playerName: string;
    /** The session to play in */
    session: string;
}

/** A WS connection to a tournament server */
export class TournamentClient {
    public readonly events = events({
        /** Emitted when an error is encountered by the socket */
        error: new Event<Error>(),

        /** Emitted once this initially connects to the tournament server */
        connected: new Event(),

        /** Emitted once the connection is closed */
        closed: new Event(),

        /** Emitted any time the tournament server sends a message */
        messaged: new Event<string>(),

        /** Emitted once we are told that we are playing a game, includes details on how to play that game */
        playing: new Event<ITournamentPlayData>(),
    });

    /** True when connected to the tournament server, false otherwise */
    public connected: boolean = false;

    /** The web socket connection we'll use to talk to the Tournament server */
    private socket: WebSocket;

    /**
     * connects to a remote tournament server
     * @param {string} server the server to connection to via web sockets
     * @param {number} port the port for the server
     * @param {string} playerName the name for the human player, must match
     *                            exactly as the one on the tournament server
     */
    public connect(server: string, port: number, playerName: string = "ReplaceMe"): void {
        try {
            this.socket = new WebSocket(`ws://${server}:${port}`);
        }
        catch (err) {
            this.events.error.emit(err);
        }

        this.socket.onopen = () => {
            this.connected = true;
            this.events.connected.emit(undefined);

            this.send("register", {
                type: "Viseur",
                name: playerName || "Human Player",
                password: "ReplaceMe", // yes, "ReplaceMe" is the correct value
            });
        };

        this.socket.onerror = (err) => {
            this.events.error.emit(new Error(err.type));
        };

        this.socket.onmessage = (message) => {
            if (viseur.settings.printIO.get()) {
                // tslint:disable-next-line:no-console
                console.log("FROM TOURNAMENT <-- ", message.data);
            }

            this.received(JSON.parse(message.data));
        };

        this.socket.onclose = () => {
            this.events.closed.emit(undefined);
        };
    }

    /**
     * Force closes the websocket connection
     */
    public close(): void {
        this.socket.close();
    }

    /**
     * sends an event to the server
     *
     * @param {string} eventName - name of the event
     * @param {Object} data - data about the event
     */
    private send(eventName: string, data: object): void {
        const str = JSON.stringify({
            event: eventName,
            data,
        });

        if (viseur.settings.printIO.get()) {
            // tslint:disable-next-line:no-console
            console.log("TO TOURNAMENT --> ", str);
        }

        this.socket.send(str);
    }

    /**
     * Invoked when we receive some data from the server
     * @param {Object} data the data received from the server
     */
    private received(data: {
        /** the event name */
        event: string;
        /** the data about the event */
        data?: any;
    }): void {
        switch (data.event) {
            case "message":
                this.onMessage(data.data);
                break;
            case "play":
                this.onPlay(data.data);
                break;
            default:
                throw new Error(`Unexpected tournament event ${data.event}`);
        }
    }

    // --- On Received Callbacks --- \\

    /**
     * Invoked on a 'message' event
     * @param {string} data the message sent from the server
     */
    private onMessage(data: string): void {
        this.events.messaged.emit(data);
    }

    /**
     * Invoked on a 'play' event
     * @param {Object} data the data on what game server to connect to for bridging the human playable connection
     */
    private onPlay(data: ITournamentPlayData): void {
        this.events.playing.emit(data);

        viseur.playAsHuman(data.game, data.server, data.port, data.session, data.playerName);
    }
}
