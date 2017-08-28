import { EventEmitter } from "events";
import { viseur } from "src/viseur";

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
}

/* tslint:disable:unified-signatures */
export interface ITournamentClient {
    /** Emitted whenever the underlying web socket connection errors */
    on(event: "error", listener: (error: any) => void): this;

    /** Emitted once this initially connects to the tournament server */
    on(event: "connected", listener: () => void): this;

    /** Emitted once the connection is closed */
    on(event: "closed", listener: () => void): this;

    /** Emitted any time the tournament server sends a message */
    on(event: "messaged", listener: (message: string) => void): this;

    /** Emitted once we are told that we are playing a game, includes details on how to play that game */
    on(event: "playing", listener: (data: ITournamentPlayData) => void): this;
}
/* tslint:enable:unified-signatures */

/** A WS connection to a tournament server */
export class TournamentClient extends EventEmitter implements ITournamentClient {
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
            this.emit("error", err);
        }

        this.socket.onopen = () => {
            this.connected = true;
            this.emit("connected");

            this.send("register", {
                type: "Viseur",
                name: playerName || "Human Player",
                password: "ReplaceMe", // yes, "ReplaceMe" is the correct value
            });
        };

        this.socket.onerror = (err) => {
            this.emit("error", err);
        };

        this.socket.onmessage = (message) => {
            if (viseur.settingsManager.get("print-io", false)) {
                // tslint:disable-next-line:no-console
                console.log("FROM TOURNAMENT <-- ", message.data);
            }

            this.received(JSON.parse(message.data));
        };

        this.socket.onclose = () => {
            this.emit("closed");
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

        if (viseur.settingsManager.get("print-io")) {
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
        this.emit("messaged", data);
    }

    /**
     * Invoked on a 'play' event
     * @param {Object} data the data on what game server to connect to for bridging the human playable connection
     */
    private onPlay(data: ITournamentPlayData): void {
        this.emit("playing", data);

        viseur.playAsHuman(data.server, data.port, data.game, data.playerName);
    }
}
