require("./fileTab.scss");

var $ = require("jquery");
var filesaverjs = require("filesaverjs");
var Classe = require("classe");
var BaseElement = require("core/ui/baseElement");
var inputs = require("core/ui/inputs/");
var Viseur = require("viseur/");

/**
 * @class FileTab - The "File" tab on the InfoPane
 */
var FileTab = Classe(BaseElement, {
    init: function(args) {
        BaseElement.init.apply(this, arguments);
        var self = this;

        this.$localGamelogWrapper = this.$element.find(".local-gamelog");

        this.gamelogInput = new inputs.File({
            id: "local-gamelog-input",
            $parent: this.$localGamelogWrapper,
        });

        this.gamelogInput.on("loading", function() {
            self._localGamelogLoading();
        });

        this.$connectionWrapper = this.$element.find(".connection-info").addClass("collapsed");
        this.$connectionLog = this.$connectionWrapper.find(".connection-log");

        this.$remoteGamelogWrapper = this.$element.find(".remote-gamelog");

        this.remoteGamelogTypeInput = new inputs.DropDown({
            id: "remote-gamelog-type",
            label: "Connection Type",
            $parent: this.$remoteGamelogWrapper,
            options: [ "Arena", "Human", "Spectate", "Tournament" ],
        });


        this.remoteGamelogTypeInput.on("changed", function(newVal) {
            self._onRemoteGamelogTypeChange(newVal);
        });

        var games = require("games/");
        this.gameInput = new inputs.DropDown({
            id: "remote-game-name",
            label: "Game",
            $parent: this.$remoteGamelogWrapper,
            options: Object.keys(games).sortAscending(),
        });

        this.serverInput = new inputs.TextBox({
            id: "remote-gamelog-server",
            label: "Server",
            $parent: this.$remoteGamelogWrapper,
            value: window.location.hostname,
        });

        this.portInput = new inputs.Number({
            id: "remote-gamelog-port",
            label: "Port",
            $parent: this.$remoteGamelogWrapper,
            min: 0,
            max: 65535, // port is an unsigned 16-bit number, so this is max
        });

        this.nameInput = new inputs.TextBox({
            id: "remote-gamelog-name",
            label: "Player Name",
            $parent: this.$remoteGamelogWrapper,
            value: "Human",
        });

        this.connectButton = new inputs.Button({
            id: "remote-gamelog-connect",
            text: "Connect",
            label: " ",
            $parent: this.$remoteGamelogWrapper,
        });

        this.connectButton.on("clicked", function() {
            self._connect();
        });

        this.remoteGamelogTypeInput.setValue("Spectate");
        this._onRemoteGamelogTypeChange("Spectate");

        this.$gamelogDownloadSection = this.$element.find(".download-gamelog")
            .addClass("collapsed");
        this.$gamelogDownloadLink = this.$element.find(".download-gamelog-link");

        Viseur.on("gamelog-is-remote", function(url) {
            self._log("Downloading remote gamelog at " + url);
        });

        Viseur.on("ready", function(gameName, gamelog, unparsedGamelog) {
            self.$localGamelogWrapper.addClass("collapsed");
            self.$remoteGamelogWrapper.addClass("collapsed");

            if(!gamelog.streaming) { // then let them download the gamelog from memory, otherwise it is being streamed so the gamelog in memory is incomplete
                self.$gamelogDownloadLink.on("click", function() {
                    var blob = new Blob([unparsedGamelog], {type: "application/json;charset=utf-8"});
                    filesaverjs.saveAs(blob, "{}-{}.json".format(gamelog.gameName, gamelog.gameSession));
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
     * Invoked when the gamelog type input changes values, so certain fields may need to be shown/hidden
     *
     * @param {string} newType, the new type that it was changed to
     */
    _onRemoteGamelogTypeChange: function(newType) {
        var port = parseInt(window.location.port);
        var showName = false;
        var showPort = true;
        var showGame = true;

        switch(newType) {
            case "Arena":
                showPort = false;
                showGame = false;
                break;
            case "Human":
                port = 3088;
                showName = true;
                break;
            case "Spectate":
                port = 3088;
                break;
            case "Tournament":
                port = 5454;
                showName = true;
                break;
        }

        this.portInput.setValue(port);
        this.portInput.field.$element.toggleClass("collapsed", !showPort);

        this.nameInput.field.$element.toggleClass("collapsed", !showName);

        this.gameInput.field.$element.toggleClass("collapsed", !showGame);
    },

    /**
     * invoked when the connect button is pressed
     *
     * @private
     */
    _connect: function() {
        var self = this;
        this.$remoteGamelogWrapper.addClass("collapsed");
        this.$connectionWrapper.removeClass("collapsed");

        var args = {
            gameName: this.gameInput.getValue(),
            type: self.remoteGamelogTypeInput.getValue(),
            server: self.serverInput.getValue(),
            port: self.portInput.getValue(),
            playerName: self.nameInput.getValue(),
        };

        this._log("Connecting to {server}:{port}.".format(args));

        Viseur.on("connection-connected", function() {
            self._log("Successfully connected to {server}:{port}.".format(args));
        });

        Viseur.on("connection-errored", function() {
            self._log("Unexpected error occured in connection.");
        });

        Viseur.on("connection-closed", function() {
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
});

module.exports = FileTab;
