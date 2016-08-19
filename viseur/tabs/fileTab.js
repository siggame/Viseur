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

        this.$localGamelogWrapper = this.$element.find(".local-gamelog");

        this.gamelogInput = new inputs.File({
            id: "local-gamelog-input",
            $parent: this.$localGamelogWrapper,
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


        var self = this;
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

        Viseur.on("ready", function(gameName, gamelog) {
            if(!gamelog.streaming) { // then let them download the gamelog from memory, otherwise it is being streamed so the gamelog in memory is incomplete
                self.$gamelogDownloadLink.on("click", function() {
                    var blob = new Blob([JSON.stringify(gamelog)], {type: "application/json;charset=utf-8"});
                    filesaverjs.saveAs(blob, "gamelog.json");
                });

                self._log("Gamelog successfuly loaded.");
            }

            self.$localGamelogWrapper.addClass("collapsed");
            self.$remoteGamelogWrapper.addClass("collapsed");
            self.$gamelogDownloadSection.removeClass("collapsed");
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
        switch(newType) {
            case "Arena":
                port = 7777;// TODO: find arena port
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
        this.nameInput.field.$element.toggleClass("collapsed", !showName);
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
});

module.exports = FileTab;
