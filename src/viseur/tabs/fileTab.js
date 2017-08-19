require("./fileTab.scss");

var $ = require("jquery");
var filesaver = require("file-saver");
var Classe = require("classe");
var BaseElement = require("src/core/ui/baseElement");
var inputs = require("src/core/ui/inputs/");
var config = require("src/../config.json").connectTab || {};
var Viseur = require("src/viseur/");

/**
 * @class FileTab - The "File" tab on the InfoPane
 */
var FileTab = Classe(BaseElement, {
    init: function(args) {
        BaseElement.init.apply(this, arguments);

        this._initLocalGamelogSection();
        this._initRemoteGamelogSection();
        this._initConnectSection();
        this._initDownloadSection();

        var self = this;
        Viseur.on("gamelog-is-remote", function(url) {
            self._log("Downloading remote gamelog.");
        });

        Viseur.on("log-connection", function(str) {
            self._log(str);
        });

        Viseur.on("ready", function(gameName, gamelog, unparsedGamelog) {
            self.$localGamelogWrapper.addClass("collapsed");
            self.$remoteGamelogWrapper.addClass("collapsed");
            self.$connectWrapper.addClass("collapsed");

            if(!gamelog.streaming) { // then let them download the gamelog from memory, otherwise it is being streamed so the gamelog in memory is incomplete
                self.$gamelogDownloadLink.on("click", function() {
                    var blob = new Blob([unparsedGamelog], {type: "application/json;charset=utf-8"});
                    filesaver.saveAs(blob, "{}-{}.json".format(gamelog.gameName, gamelog.gameSession));
                });

                self._log("Gamelog successfuly loaded.");
                self.$gamelogDownloadSection.removeClass("collapsed");
            }
            else { // don't show them the downlaod section until the gamelog is finished streaming in
                Viseur.on("gamelog-finalized", function(finalGamelog, gamelogURL) {
                    self.$gamelogDownloadLink.attr("href", gamelogURL);
                    self.$gamelogDownloadSection.removeClass("collapsed");
                });
            }
        });
    },

    _template: require("./fileTab.hbs"),

    /**
     * Initializes the "Local Gamelog" section
     */
    _initLocalGamelogSection: function() {
        this.$localGamelogWrapper = this.$element.find(".local-gamelog");

        this.gamelogInput = new inputs.File({
            id: "local-gamelog-input",
            $parent: this.$localGamelogWrapper,
        });

        var self = this;
        this.gamelogInput.on("loading", function() {
            self._localGamelogLoading();
        });
    },

    /**
     * Initializes the "Remote Gamelog" section
     */
    _initRemoteGamelogSection: function() {
        var self = this;

        this.$remoteGamelogWrapper = this.$element.find(".remote-gamelog");

        this.remoteGamelogInput = new inputs.TextBox({
            id: "remote-gamelog-input",
            label: "Url",
            placeholder: "Enter url to gamelog",
            $parent: this.$remoteGamelogWrapper,
        });

        this.remoteGamelogInput.on("submitted", function(url) {
            self._remoteGamelogSubmitted(url);
        });

        this.remoteVisualizeButton = new inputs.Button({
            id: "remote-gamelog-button",
            text: "Visualize",
            label: " ",
            $parent: this.$remoteGamelogWrapper,
        });

        this.remoteVisualizeButton.on("clicked", function() {
            self._remoteGamelogSubmitted(self.remoteGamelogInput.getValue());
        });
    },

    /**
     * Initializes the "Connect" section
     */
    _initConnectSection: function() {
        var self = this;
        this.$connectionWrapper = this.$element.find(".connection-info").addClass("collapsed");
        this.$connectionLog = this.$connectionWrapper.find(".connection-log");

        this.$connectWrapper = this.$element.find(".connect");

        this.connectTypeInput = new inputs.DropDown({
            id: "connect-type",
            label: "Connection Type",
            $parent: this.$connectWrapper,
            options: [ "Arena", "Human", "Spectate", "Tournament" ],
        });


        this.connectTypeInput.on("changed", function(newVal) {
            self._onconnectTypeChange(newVal);
        });

        var games = require("src/games/");
        this._allGames = Object.keys(games).sortAscending();
        this._humanPlayableGames = [];
        for(var gameName in games) {
            if(games.hasOwnProperty(gameName)) {
                if(games[gameName].HumanPlayer.implimented) {
                    this._humanPlayableGames.push(gameName);
                }
            }
        }
        this._humanPlayableGames.sortAscending();


        this.gameInput = new inputs.DropDown({
            id: "remote-game-name",
            label: "Game",
            $parent: this.$connectWrapper,
            options: this._allGames,
        });

        this.gameSettingsInput = new inputs.TextBox({
            id: "connect-game-settings",
            label: "Game Settings",
            $parent: this.$connectWrapper,
        });

        this.sessionInput = new inputs.TextBox({
            id: "connect-session",
            label: "Session",
            $parent: this.$connectWrapper,
            placeholder: config.session || "new",
        });

        this.serverInput = new inputs.TextBox({
            id: "connect-server",
            label: "Server",
            $parent: this.$connectWrapper,
            value: config.server || window.location.hostname,
        });

        this.portInput = new inputs.Number({
            id: "connect-port",
            label: "Port",
            $parent: this.$connectWrapper,
            min: 0,
            max: 65535, // port is an unsigned 16-bit number, so this is max
        });

        this.nameInput = new inputs.TextBox({
            id: "connect-name",
            label: "Player Name",
            $parent: this.$connectWrapper,
            placeholder: config.humanName || "Human",
        });

        this.presentationInput = new inputs.CheckBox({
            id: "presentation-mode",
            label: "Presentation Mode",
            $parent: this.$connectWrapper,
            value: true,
        });

        this.connectButton = new inputs.Button({
            id: "connect-connect-button",
            text: "Connect",
            label: " ",
            $parent: this.$connectWrapper,
        });

        this.connectButton.on("clicked", function() {
            self._connect();
        });

        this.connectTypeInput.setValue("Spectate");
        this._onconnectTypeChange("Spectate");

        // if in the config there is a default game
        if(config.game) {
            // set it here, if we did it in the gameInput DropDown constructor, it would have gotten overriden from the connect input type changed where it moves around options
            this.gameInput.setValue(config.game);
        }
    },

    /**
     * Initializes the "Download Gamelog" section
     */
    _initDownloadSection: function() {
        this.$gamelogDownloadSection = this.$element.find(".download-gamelog")
            .addClass("collapsed");

        this.$gamelogDownloadLink = this.$element.find(".download-gamelog-link");
    },

    /**
     * Invoked when the gamelog type input changes values, so certain fields may need to be shown/hidden
     *
     * @param {string} newType, the new type that it was changed to
     */
    _onconnectTypeChange: function(newType) {
        var port = parseInt(window.location.port);
        var showName = false;
        var showPort = true;
        var showGame = true;
        var showSession = false;
        var showPresentation = false;
        var showGameSettings = false;
        var humanPlayable = false;

        switch(newType) {
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

        this.gameInput.setOptions(humanPlayable ? this._humanPlayableGames : this._allGames);

        this.portInput.setValue(port);
        this.portInput.field.$element.toggleClass("collapsed", !showPort);

        this.nameInput.field.$element.toggleClass("collapsed", !showName);
        this.sessionInput.field.$element.toggleClass("collapsed", !showSession);

        this.gameInput.field.$element.toggleClass("collapsed", !showGame);
        this.gameSettingsInput.field.$element.toggleClass("collapsed", !showGameSettings);

        this.presentationInput.field.$element.toggleClass("collapsed", !showPresentation);
    },

    /**
     * invoked when the connect button is pressed
     *
     * @private
     */
    _connect: function() {
        var self = this;
        this.$connectWrapper.addClass("collapsed");
        this.$connectionWrapper.removeClass("collapsed");

        var args = {
            gameName: this.gameInput.getValue(),
            gameSettings: this.gameSettingsInput.getValue(),
            type: self.connectTypeInput.getValue(),
            server: self.serverInput.getValue(),
            port: self.portInput.getValue(),
            session: self.sessionInput.getValue() || "new",
            playerName: self.nameInput.getValue() || "Human",
            presentationMode: self.presentationInput.getValue(),
        };

        this._log("Connecting to {server}:{port}.".format(args));

        if(args.gameSettings && !args.gameSettings.trim()) { // it's whitespace value, so don't send it
            delete args.gameSettings;
        }

        Viseur.on("connection-connected", function() {
            self._log("Successfully connected to {server}:{port}.".format(args));
        });

        Viseur.on("connection-errored", function() {
            self._log("Unexpected error occured in connection.");
        });

        Viseur.on("connection-closed", function(timedOut) {
            self._log("You timed out and were forcibly disconnected.");
            self._log("Connection closed.");
        });

        Viseur.connect(args);
    },

    /**
     * Logs some string to the connection log
     *
     * @private
     * @param {string} str - the string to log
     */
    _log: function(str) {
        this.$connectionWrapper.removeClass("collapsed");

        this.$connectionLog.append($("<li>")
            .html(str)
        );
    },

    /**
     * Invoked when the local gamelog input starts loading a file
     */
    _localGamelogLoading: function() {
        Viseur.gui.modalMessage("Loading local gamelog.");

        this.gamelogInput.on("loaded", function(str) {
            Viseur.gui.modalMessage("Local gamelog loaded");

            Viseur.parseGamelog(str);
        });
    },

    /**
     * Invoked when a remote gamelog url is submitted
     *
     * @param {string} url - url from the input box
     */
    _remoteGamelogSubmitted: function(url) {
        Viseur.loadRemoteGamelog(url);
    },
});

module.exports = FileTab;
