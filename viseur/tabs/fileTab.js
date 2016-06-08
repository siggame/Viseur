require("./fileTab.scss");

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

        this.remoteGamelogTypeInput.setValue("Spectate");
        this._onRemoteGamelogTypeChange("Spectate");

        this.$gamelogDownloadSection = this.$element.find(".download-gamelog")
            .addClass("collapsed");
        this.$gamelogDownloadLink = this.$element.find(".download-gamelog-link");

        Viseur.on("gamelog-loaded", function(gamelog, remote) {
            self.$gamelogDownloadLink.on("click", function() {
                var blob = new Blob([JSON.stringify(gamelog)], {type: "application/json;charset=utf-8"});
                filesaverjs.saveAs(blob, "gamelog.json");
            });
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
});

module.exports = FileTab;
