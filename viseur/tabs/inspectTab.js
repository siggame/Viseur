require("./inspectTab.scss");

var $ = require("jquery");
var Classe = require("classe");
var dateFormat = require("dateformat");
var BaseElement = require("core/ui/baseElement");
var Observable = require("core/observable");
var InspectTreeView = require("./inspectTreeView");
var Viseur = require("../viseur");

/**
 * @class InspectTab - The "Inspect" tab on the InfoPane, displaying settings (both for the core and by game)
 */
var InspectTab = Classe(Observable, BaseElement, {
    init: function(args) {
        Observable.init.call(this);
        BaseElement.init.apply(this, arguments);

        this.$gamelogDate = $(".gamelog-date", this.$element);
        this.$gamelogRandomSeed = $(".gamelog-random-seed", this.$element);
        this.$gamelogGameName = this.$element.find(".gamelog-game-name");
        this.$gamelogGameSession = this.$element.find(".gamelog-game-session");

        var self = this;
        Viseur.once("ready", function(game, gamelog) {
            self._viseurReady(game, gamelog);
        });

        this.gameTreeView = new InspectTreeView({
            $parent: $(".inspect-game", this.$element),
        });

        this.dataTreeView = new InspectTreeView({
            $parent: $(".delta-data", this.$element),
        });

        this.$deltaType = this.$element.find(".delta-type");

        Viseur.on("state-changed", function(stateData) {
            var gameObjects = stateData.game.gameObjects;

            self.$deltaType.html(stateData.type);

            self.dataTreeView.display(stateData.data || {}, gameObjects, self.gameTreeView);
            self.gameTreeView.display(stateData.game, gameObjects);
        });
    },

    _template: require("./inspectTab.hbs"),

    /**
     * Invoked once Viseur is ready
     *
     * @private
     * @param {BaseGame} game - the game that is ready
     * @param {Object} gamelog - the gamelog that we will be inspecting
     */
    _viseurReady: function(game, gamelog) {
        if(gamelog.epoch) {
            this.$gamelogDate.html(dateFormat(new Date(gamelog.epoch), "mmmm dS, yyyy, h:MM:ss:l TT Z"));
        }

        this.$gamelogRandomSeed.html(gamelog.randomSeed);
        this.$gamelogGameName.html(gamelog.gameName);
        this.$gamelogGameSession.html(gamelog.gameSession);

        this.$element.addClass("gamelog-loaded");

        var self = this;
        game.on("inspect", function(gameObjectID) {
            self.gameTreeView.highlightGameObject(gameObjectID);
            game.highlight(gameObjectID);

            self._emit("highlighted", gameObjectID);
        });
    },
});

module.exports = InspectTab;
