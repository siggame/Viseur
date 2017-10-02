import * as fileSaver from "file-saver";
import * as config from "src/../config.json";
import { inputs, ITabArgs, Tab } from "src/core/ui";
import { sortedAscending } from "src/utils";
import { viseur } from "src/viseur";
import "./file-tab.scss";

/**
 * The "File" tab on the InfoPane, handles gamelog file I/O
 */
export class FileTab extends Tab {
    /** The title of the tab */
    public get title(): string {
        return "File";
    }

    // ---- Local Gamelog Section ---- \\

    /** The wrapper for the local gamelog section */
    private localGamelogWrapper = this.element.find(".local-gamelog");

    /** The file input to load a local gamelog */
    private gamelogInput = new inputs.FileInput({
        id: "local-gamelog-input",
        parent: this.localGamelogWrapper,
    });

    // ---- Remote Gamelog Section ---- \\

    /** The wrapper for the [remote] gamelog section */
    private remoteGamelogWrapper = this.element.find(".remote-gamelog");

    /** The url input for the remote gamelog to load */
    private remoteGamelogInput = new inputs.TextBox({
        id: "remote-gamelog-input",
        label: "Url",
        placeholder: "Enter url to gamelog",
        parent: this.remoteGamelogWrapper,
    });

    /** The button to click to load the remote gamelog and visualize it */
    private remoteVisualizeButton = new inputs.Button({
        id: "remote-gamelog-button",
        text: "Visualize",
        // label: "",
        parent: this.remoteGamelogWrapper,
    });

    // ---- Connect Section ---- \\

    /** The wrapper for the connection section */
    private connectionWrapper = this.element.find(".connection-info").addClass("collapsed");

    /** The log of all connection events */
    private connectionLog = this.connectionWrapper.find(".connection-log");

    /** The wrapper for the connect form */
    private connectWrapper = this.element.find(".connect");

    /** The drop down to select the connection type */
    private connectTypeInput = new inputs.DropDown<string>({
        id: "connect-type",
        label: "Connection Type",
        parent: this.connectWrapper,
        options: [ "Arena", "Human", "Spectate", "Tournament" ],
    });

    // - connection inputs - \\

    /** The names of all the games sorted */
    private gameNames = sortedAscending(Object.keys(viseur.games));

    /** The names of all the games that are playable by humans, sorted */
    private humanGameNames = this.gameNames.filter((name) => viseur.games[name].HumanPlayer.implemented);

    private gameInput = new inputs.DropDown<string>({
        id: "remote-game-name",
        label: "Game",
        parent: this.connectWrapper,
        options: this.gameNames,
    });

    private gameSettingsInput = new inputs.TextBox({
        id: "connect-game-settings",
        label: "Game Settings",
        parent: this.connectWrapper,
    });

    private sessionInput = new inputs.TextBox({
        id: "connect-session",
        label: "Session",
        parent: this.connectWrapper,
        placeholder: config.session || "new",
    });

    private serverInput = new inputs.TextBox({
        id: "connect-server",
        label: "Server",
        parent: this.connectWrapper,
        value: config.server || window.location.hostname,
    });

    private portInput = new inputs.NumberInput({
        id: "connect-port",
        label: "Port",
        parent: this.connectWrapper,
        min: 0,
        max: 65535, // port is an unsigned 16-bit number, so this is max
    });

    private nameInput = new inputs.TextBox({
        id: "connect-name",
        label: "Player Name",
        parent: this.connectWrapper,
        placeholder: config.humanName || "Human",
    });

    private presentationInput = new inputs.CheckBox({
        id: "presentation-mode",
        label: "Presentation Mode",
        parent: this.connectWrapper,
        value: true,
    });

    private connectButton = new inputs.Button({
        id: "connect-connect-button",
        text: "Connect",
        // label: " ",
        parent: this.connectWrapper,
    });

    // ---- Download Section ---- \\

    /** The section element for the downloads */
    private gamelogDownloadSection = this.element.find(".download-gamelog").addClass("collapsed");

    /** The link to download the gamelog */
    private gamelogDownloadLink = this.element.find(".download-gamelog-link");

    /**
     * Creates the File Tab
     * @param args the tab arguments
     */
    constructor(args: ITabArgs) {
        super(args);

        // -- gamelog section -- \\
        this.gamelogInput.events.loading.on(() => {
            this.localGamelogLoading();
        });

        this.remoteGamelogInput.events.submitted.on((url) => {
            this.remoteGamelogSubmitted(url);
        });

        this.remoteVisualizeButton.events.clicked.on(() => {
            this.remoteGamelogSubmitted(this.remoteGamelogInput.value);
        });

        this.connectTypeInput.events.changed.on((newVal) => {
            this.onConnectTypeChange(newVal);
        });

        // -- connection section -- \\
        viseur.events.gamelogIsRemote.on((url) => {
            this.log("Downloading remote gamelog.");
        });

        viseur.events.connectionMessage.on((message) => {
            this.log(message);
        });

        // -- connection input section -- \\

        this.connectButton.events.clicked.on(() => {
            this.connect();
        });

        this.connectTypeInput.value = "Spectate";

        // if in the config there is a default game
        if (config.game) {
            // set it here, if we did it in the gameInput DropDown constructor,
            // it would have gotten overridden from the connect input type changed where it moves around options
            this.gameInput.value = config.game;
        }

        // -- do stuff when viseur is ready -- \\

        viseur.events.ready.on((data) => {
            this.localGamelogWrapper.addClass("collapsed");
            this.remoteGamelogWrapper.addClass("collapsed");
            this.connectWrapper.addClass("collapsed");

            if (!data.gamelog.streaming) {
                // then let them download the gamelog from memory,
                // otherwise it is being streamed so the gamelog in memory is incomplete
                this.gamelogDownloadLink.on("click", () => {
                    const blob = new Blob([viseur.unparsedGamelog], {type: "application/json;charset=utf-8"});
                    fileSaver.saveAs(blob, `${data.gamelog.gameName}-${data.gamelog.gameSession}.json`);
                });

                this.log("Gamelog successfully loaded.");
                this.gamelogDownloadSection.removeClass("collapsed");
            }
            else { // don't show them the download section until the gamelog is finished streaming in
                viseur.events.gamelogFinalized.on((finalized) => {
                    this.gamelogDownloadLink.attr("href", finalized.url);
                    this.gamelogDownloadSection.removeClass("collapsed");
                });
            }
        });
    }

    protected getTemplate(): Handlebars {
        return require("./file-tab.hbs");
    }

    /**
     * Invoked when the gamelog type input changes values, so certain fields may need to be shown/hidden
     * @param {string} newType the new type that it was changed to
     */
    private onConnectTypeChange(newType: string): void {
        let port = Number(window.location.port);
        let showName = false;
        let showPort = true;
        let showGame = true;
        let showSession = false;
        let showPresentation = false;
        let showGameSettings = false;
        let humanPlayable = false;

        switch (newType) {
            case "Arena":
                showPort = false;
                showGame = false;
                showPresentation = true;
                break;
            case "Human":
                port = 3088;
                showName = true;
                humanPlayable = true;
                showSession = true;
                showGameSettings = true;
                break;
            case "Spectate":
                port = 3088;
                showSession = true;
                break;
            case "Tournament":
                port = 5454;
                showName = true;
                humanPlayable = true;
                break;
        }

        this.gameInput.setOptions(humanPlayable
            ? this.humanGameNames
            : this.gameNames,
        );

        this.portInput.value = port;
        this.portInput.field.element.toggleClass("collapsed", !showPort);

        this.nameInput.field.element.toggleClass("collapsed", !showName);
        this.sessionInput.field.element.toggleClass("collapsed", !showSession);

        this.gameInput.field.element.toggleClass("collapsed", !showGame);
        this.gameSettingsInput.field.element.toggleClass("collapsed", !showGameSettings);

        this.presentationInput.field.element.toggleClass("collapsed", !showPresentation);
    }

    /**
     * Invoked when the connect button is pressed
     */
    private connect(): void {
        this.connectWrapper.addClass("collapsed");
        this.connectionWrapper.removeClass("collapsed");

        const gameName = this.gameInput.value;
        const server = this.serverInput.value;
        const port = this.portInput.value;
        const session = this.sessionInput.value || "new";
        const playerName = this.nameInput.value || "Human";

        this.log(`Connecting to ${server}:${port}.`);

        viseur.events.connectionConnected.once(() => {
            this.log(`Successfully connected to ${server}:${port}.`);
        });

        viseur.events.connectionError.on((err) => {
            this.log(`Unexpected error occurred in connection. ${err}`);
        });

        viseur.events.connectionClosed.once((data) => {
            if (data.timedOut) {
                this.log(`You timed out and were forcibly disconnected.`);
            }
            this.log(`Connection closed.`);
        });

        const type = this.connectTypeInput.value;
        switch (type) {
            case "Tournament":
                viseur.connectToTournament(server, port, playerName);
                return;
            case "Arena":
                viseur.startArenaMode(server, this.presentationInput.value);
                return;
            case "Human":
                viseur.playAsHuman(gameName, server, port, session, playerName, this.gameSettingsInput.value.trim());
                return;
            case "Spectate":
                viseur.spectate(server, port, gameName, session);
                return;
        }

        throw new Error(`Connection type ${type} unexpected`);
    }

    /**
     * Logs some string to the connection log
     * @param {string} message the string to log
     */
    private log(message: string): void {
        this.connectionWrapper.removeClass("collapsed");

        const li = document.createElement("li");
        li.innerHTML = message;
        this.connectionLog.append(li);
    }

    /**
     * Invoked when the local gamelog input starts loading a file
     */
    private localGamelogLoading(): void {
        viseur.gui.modalMessage("Loading local gamelog.");

        this.gamelogInput.events.loaded.on((str) => {
            viseur.gui.modalMessage("Local gamelog loaded");

            viseur.parseGamelog(str);
        });
    }

    /**
     * Invoked when a remote gamelog url is submitted
     * @param {string} url the url from the input box
     */
    private remoteGamelogSubmitted(url: string): void {
        viseur.loadRemoteGamelog(url);
    }
}
