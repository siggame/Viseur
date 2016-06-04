require("./inspectTab.scss");

var $ = require("jquery");
var Classe = require("classe");
var dateFormat = require('dateformat');
var BaseElement = require("core/ui/baseElement");
var InspectTreeView = require("./inspectTreeView");
var Viseur = require("../viseur");

/**
 * @class InspectTab - The "Inspect" tab on the InfoPane, displaying settings (both for the core and by game)
 */
var InspectTab = Classe(BaseElement, {
    init: function(args) {
        BaseElement.init.apply(this, arguments);

        this.$gamelogDate = $(".gamelog-date", this.$element);
        this.$gamelogRandomSeed = $(".gamelog-random-seed", this.$element);
        this.$gamelogGameName = this.$element.find(".gamelog-game-name");
        this.$gamelogGameSession = this.$element.find(".gamelog-game-session");

        var self = this;
        Viseur.once("gamelog-loaded", function(gamelog) {
            self.$gamelogDate.html(dateFormat(new Date(gamelog.epoch), "mmmm dS, yyyy, h:MM:ss:l TT Z"));
            self.$gamelogRandomSeed.html(gamelog.randomSeed);
            self.$gamelogGameName.html(gamelog.gameName);
            self.$gamelogGameSession.html(gamelog.gameSession);

            self.$element.addClass("gamelog-loaded");
        });


        this.gameTreeView = new InspectTreeView({
            $parent: $(".inspect-game", this.$element)
        });

        this.dataTreeView = new InspectTreeView({
            $parent: $(".delta-data", this.$element)
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
});

module.exports = InspectTab;
