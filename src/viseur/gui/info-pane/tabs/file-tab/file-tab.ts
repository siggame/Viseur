import * as fileSaver from "file-saver";
import { capitalize, escape, range } from "lodash";
import * as pako from "pako";
import { toWordsOrdinal } from "number-to-words";
import { Config } from "src/core/config";
import {
    Button,
    CheckBox,
    DropDown,
    FileInput,
    NumberInput,
    Tab,
    TextBox,
    TabArgs,
} from "src/core/ui";
import { sortedAscending } from "src/utils";
import { Viseur } from "src/viseur";
import * as fileTabHbs from "./file-tab.hbs";
import "./file-tab.scss";

/**
 * Converts a number to words.
 *
 * @param num - The number to use.
 * @returns The human readable string version.
 * @example 1 -> "First"
 */
function numberToWords(num: number): string {
    return toWordsOrdinal(num)
        .split(" ")
        .map(capitalize)
        .join(" ") // capitalize each word in between spaces,
        .split("-")
        .map(capitalize)
        .join("-"); // and dashes
}

/**
 * The "File" tab on the InfoPane, handles gamelog file I/O.
 */
export class FileTab extends Tab {
    /** The instance of Viseur that controls everything. */
    private readonly viseur: Viseur;

    // ---- Local Gamelog Section ---- \\

    /** The wrapper for the local gamelog section. */
    private readonly localGamelogWrapper = this.element.find(".local-gamelog");

    /** The file input to load a local gamelog. */
    private readonly gamelogInput = new FileInput({
        id: "local-gamelog-input",
        parent: this.localGamelogWrapper,
        label: "Choose saved gamelog",
    });

    // ---- Remote Gamelog Section ---- \\

    /** The wrapper for the [remote] gamelog section. */
    private readonly remoteGamelogWrapper = this.element.find(
        ".remote-gamelog",
    );

    /** The url input for the remote gamelog to load. */
    private readonly remoteGamelogInput = new TextBox({
        id: "remote-gamelog-input",
        label: "Url",
        placeholder: "Enter url to gamelog",
        parent: this.remoteGamelogWrapper,
    });

    /** The button to click to load the remote gamelog and visualize it. */
    private readonly remoteVisualizeButton = new Button({
        id: "remote-gamelog-button",
        text: "Visualize",
        // label: "",
        parent: this.remoteGamelogWrapper,
    });

    // ---- Connect Section ---- \\

    /** The wrapper for the connection section. */
    private readonly connectionWrapper = this.element
        .find(".connection-info")
        .addClass("collapsed");

    /** The log of all connection events. */
    private readonly connectionLog = this.connectionWrapper.find(
        ".connection-log",
    );

    /** The wrapper for the connect form. */
    private readonly connectWrapper = this.element.find(".connect");

    /** The drop down to select the connection type. */
    private readonly connectTypeInput = new DropDown<
        "Arena" | "Human" | "Spectate" | "Tournament"
    >({
        id: "connect-type",
        label: "Connection Type",
        parent: this.connectWrapper,
        options: ["Arena", "Human", "Spectate", "Tournament"],
    });

    // - connection inputs - \\

    /** The names of all the games sorted. */
    private readonly gameNames: string[] = [];

    /** The names of all the games that are playable by humans, sorted. */
    private readonly humanGameNames: string[];

    /** The game [name] input field. */
    private readonly gameInput = new DropDown<string>({
        id: "remote-game-name",
        label: "Game",
        parent: this.connectWrapper,
        options: this.gameNames,
    });

    /** The game settings string input field. */
    private readonly gameSettingsInput = new TextBox({
        id: "connect-game-settings",
        label: "Game Settings",
        parent: this.connectWrapper,
    });

    /** The game session string input field. */
    private readonly sessionInput = new TextBox({
        id: "connect-session",
        label: "Session",
        parent: this.connectWrapper,
        placeholder: Config.session || "*",
    });

    /** The game server string input field. */
    private readonly serverInput = new TextBox({
        id: "connect-server",
        label: "Server",
        parent: this.connectWrapper,
        value: Config.gameServer || window.location.hostname,
    });

    /** The port number input field. */
    private readonly portInput = new NumberInput({
        id: "connect-port",
        label: "Port",
        parent: this.connectWrapper,
        min: 0,
        max: 65535, // ports are an unsigned 16-bit number, so this is the max
    });

    /** The player's name string input field. */
    private readonly nameInput = new TextBox({
        id: "connect-name",
        label: "Player Name",
        parent: this.connectWrapper,
        placeholder: Config.humanName || "Human",
    });

    /** The requested player's index field. */
    private readonly playerIndexInput = new DropDown({
        id: "player-index-input",
        label: "Player Index",
        parent: this.connectWrapper,
        hint: "Specify which player index (order) you are.",
        options: [], // will be re-generated in onGameChange
    });

    /** The check box for if this should restart in presentation mode. */
    private readonly presentationInput = new CheckBox({
        id: "presentation-mode",
        label: "Presentation Mode",
        parent: this.connectWrapper,
        value: true,
    });

    /** The check box for if this should restart in presentation mode. */
    private readonly legacyInput = new CheckBox({
        id: "legacy-mode",
        label: "Legacy Mode",
        parent: this.connectWrapper,
        value: true,
        hint: "Legacy arena mode for the previous Python arena",
    });

    /** The button that starts the remote connection. */
    private readonly connectButton = new Button({
        id: "connect-connect-button",
        text: "Connect",
        // label: " ",
        parent: this.connectWrapper,
    });

    // ---- Download Section ---- \\

    /** The section element for the downloads. */
    private readonly gamelogDownloadSection = this.element
        .find(".download-gamelog")
        .addClass("collapsed");

    /** The link to download the gamelog. */
    private readonly gamelogDownloadLink = this.element.find(
        ".download-gamelog-link",
    );

    /**
     * Creates the File Tab.
     *
     * @param args - The tab arguments.
     */
    constructor(
        args: TabArgs & {
            /** The Viseur instance we are a part of. */
            viseur: Viseur;
        },
    ) {
        super({
            contentTemplate: fileTabHbs,
            title: "File",
            ...args,
        });

        this.viseur = args.viseur;
        this.gameNames = sortedAscending(Object.keys(this.viseur.games));
        this.humanGameNames = this.gameNames.filter((name) => {
            const game = this.viseur.games[name];

            return game ? game.HumanPlayer.implemented : false; // should not ever happen, this means no game for the name
        });

        // -- gamelog section -- \\
        this.gamelogInput.eventLoading.on(() => {
            this.localGamelogLoading();
        });

        this.remoteGamelogInput.eventSubmitted.on((url) => {
            this.remoteGamelogSubmitted(url);
        });

        this.remoteVisualizeButton.eventClicked.on(() => {
            this.remoteGamelogSubmitted(this.remoteGamelogInput.value);
        });

        this.connectTypeInput.eventChanged.on((newVal) => {
            this.onConnectTypeChange(newVal);
        });

        this.gameInput.eventChanged.on((gameName) => {
            this.onGameChange(gameName);
        });

        // -- connection section -- \\
        this.viseur.eventGamelogIsRemote.on(() => {
            this.log("Downloading remote gamelog.");
        });

        this.viseur.eventConnectionMessage.on((message) => {
            this.log(message);
        });

        // -- connection input section -- \\

        this.connectButton.eventClicked.on(() => {
            this.connect();
        });

        this.connectTypeInput.value = "Human"; // default connection type

        // if in the config there is a default game
        if (Config.game) {
            // set it here, if we did it in the gameInput DropDown constructor,
            // it would have gotten overridden from the connect input type changed where it moves around options
            this.gameInput.value = String(Config.game);
        }

        // -- do stuff when viseur is ready -- \\

        this.viseur.eventReady.on((data) => {
            this.localGamelogWrapper.addClass("collapsed");
            this.remoteGamelogWrapper.addClass("collapsed");
            this.connectWrapper.addClass("collapsed");

            if (!data.gamelog.streaming) {
                // then let them download the gamelog from memory,
                // otherwise it is being streamed so the gamelog in memory is incomplete
                this.gamelogDownloadLink.on("click", () => {
                    const blob = new Blob(
                        [
                            this.viseur.unparsedGamelog ||
                                JSON.stringify({ error: "No gamelog!" }),
                        ],
                        { type: "application/json;charset=utf-8" },
                    );
                    fileSaver.saveAs(
                        blob,
                        `${data.gamelog.gameName}-${data.gamelog.gameSession}.json`,
                    );
                });

                this.log("Gamelog successfully loaded.");
                this.gamelogDownloadSection.removeClass("collapsed");
            } else {
                // don't show them the download section until the gamelog is finished streaming in
                this.viseur.eventGamelogFinalized.on((finalized) => {
                    this.gamelogDownloadLink.attr("href", finalized.url);
                    this.gamelogDownloadSection.removeClass("collapsed");
                });
            }
        });
    }

    /**
     * Invoked when the gamelog type input changes values,
     * so certain fields may need to be shown/hidden.
     *
     * @param newType - The new type that it was changed to.
     */
    private onConnectTypeChange(newType: string): void {
        let port = Number(window.location.port);
        let server = Config.gameServer;
        let showName = false;
        let showPlayerIndex = false;
        let showPort = true;
        let showGame = true;
        let showSession = false;
        let showPresentation = false;
        let showGameSettings = false;
        let humanPlayable = false;
        let showLegacy = false;

        switch (newType) {
            case "Arena":
                server = Config.arenaServer;
                showPort = false;
                showGame = false;
                showPresentation = true;
                showLegacy = true;
                break;
            case "Human":
                port = 3088;
                showName = true;
                humanPlayable = true;
                showSession = true;
                showGameSettings = true;
                showPlayerIndex = true;
                break;
            case "Spectate":
                port = 3088;
                showSession = true;
                break;
            case "Tournament":
                server = Config.tournamentServer;
                port = 5454;
                showName = true;
                humanPlayable = true;
        }

        this.gameInput.setOptions(
            humanPlayable ? this.humanGameNames : this.gameNames,
        );

        this.serverInput.value = server;
        this.portInput.value = port;

        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        // TODO: make field better so this is not needed
        this.portInput.field!.element.toggleClass("collapsed", !showPort);

        this.nameInput.field!.element.toggleClass("collapsed", !showName);
        this.sessionInput.field!.element.toggleClass(
            "collapsed",
            !showSession,
        );

        this.gameInput.field!.element.toggleClass("collapsed", !showGame);
        this.gameSettingsInput.field!.element.toggleClass(
            "collapsed",
            !showGameSettings,
        );
        this.playerIndexInput.field!.element.toggleClass(
            "collapsed",
            !showPlayerIndex,
        );

        this.legacyInput.field!.element.toggleClass("collapsed", !showLegacy);
        this.presentationInput.field!.element.toggleClass(
            "collapsed",
            !showPresentation,
        );
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
    }

    /**
     * Invoked when the game input changes value.
     *
     * @param gameName - THe new name of the game.
     */
    private onGameChange(gameName: string): void {
        const namespace = this.viseur.games[gameName];

        const n = namespace ? namespace.Game.numberOfPlayers : 2;

        this.playerIndexInput.setOptions([
            { text: "Any", value: "" },
            ...(namespace
                ? range(n).map((i) => ({
                      text: numberToWords(i + 1),
                      value: String(i),
                  }))
                : []),
        ]);
    }

    /**
     * Invoked when the connect button is pressed.
     */
    private connect(): void {
        this.connectWrapper.addClass("collapsed");
        this.connectionWrapper.removeClass("collapsed");

        const gameName = this.gameInput.value;
        const server = this.serverInput.value;
        const port = this.portInput.value;
        const session = this.sessionInput.value || "*";
        const playerName = this.nameInput.value || "Human";

        this.log(`Connecting to ${server}:${port}.`);

        this.viseur.eventConnectionConnected.once(() => {
            this.log(`Successfully connected to ${server}:${port}.`);
        });

        this.viseur.eventConnectionError.on((err) => {
            this.log(
                `Unexpected error occurred in connection. '${err.name}' - '${err.message}'`,
                true,
            );
        });

        this.viseur.eventConnectionClosed.once((data) => {
            if (data.timedOut) {
                this.log(
                    "You timed out and were forcibly disconnected.",
                    true,
                );
            }
            this.log("Connection closed.");
        });

        const type = this.connectTypeInput.value;
        switch (type) {
            case "Tournament":
                this.viseur.connectToTournament(server, port, playerName);
                break;
            case "Arena":
                this.viseur.startArenaMode(
                    server,
                    this.presentationInput.value,
                    this.legacyInput.value,
                );
                break;
            case "Human":
                this.viseur.playAsHuman({
                    gameName,
                    server,
                    port,
                    session,
                    playerName,
                    playerIndex: this.playerIndexInput.value || undefined,
                    gameSettings: this.gameSettingsInput.value.trim(),
                });
                break;
            case "Spectate":
                this.viseur.spectate(server, port, gameName, session);
                break;
            default:
                throw new Error(
                    `Connection type '${String(type)}' unexpected`,
                );
        }
    }

    /**
     * Logs some string to the connection log.
     *
     * @param message - The string to log.
     * @param error - If this string is an error message.
     */
    private log(message: string, error?: true): void {
        this.connectionWrapper.removeClass("collapsed");

        const li = document.createElement("li");
        li.innerHTML = escape(message);
        if (error) {
            li.classList.add("error");
        }
        this.connectionLog.append(li);
    }

    /**
     * Invoked when the local gamelog input starts loading a file.
     */
    private localGamelogLoading(): void {
        this.viseur.gui.modalMessage("Loading local gamelog.");

        this.gamelogInput.eventLoaded.on((str) => {
            let gamelogString = str;
            if (str[0] !== "{") {
                // assume it's a binary zgip file
                gamelogString = pako.inflate(str, { to: "string" });
            }
            this.viseur.gui.modalMessage("Local gamelog loaded");

            this.viseur.parseGamelog(gamelogString);
        });
    }

    /**
     * Invoked when a remote gamelog url is submitted.
     *
     * @param url - The url from the input box.
     */
    private remoteGamelogSubmitted(url: string): void {
        this.viseur.loadRemoteGamelog(url);
    }
}
