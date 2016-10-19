require("./gameOverScreen.scss");

var $ = require("jquery");
var Classe = require("classe");
var BaseElement = require("core/ui/baseElement");
var partial = require("core/partial");
var Viseur = null;

/**
 * @class GameOverScreen - a screen that overlays the renderer when the game is over
 */
var GameOverScreen = Classe(BaseElement, {
    /**
     * Initialized the game over screen
     *
     * @constructor
     * @param {Object} args - BaseElement init args
     */
    init: function(args) {
        BaseElement.init.apply(this, arguments);
        Viseur = require("viseur/"); // require here to avoid cycles

        this.game = args.game;
        this.$winners = this.$element.find(".game-over-winners");
        this.$losers = this.$element.find(".game-over-losers");

        this.hide();

        var self = this;
        Viseur.timeManager.on("ended", function() {
            self.show();
        });
    },

    _template: require("./gameOverScreen.hbs"),
    _itemPartial: partial(require("./gameOverScreenItem.hbs")),

    show: function() {
        this.$winners.html("");
        this.$losers.html("");

        var players = (this.game.current || this.game.next).players;
        var colors = this.game.getPlayersColors();
        for(var i = 0; i < players.length; i++) {
            var player = players[i];
            var color = colors[i].clone().clearer(0.375);

            var $list = (player.won ? this.$winners : this.$losers);
            this._itemPartial({
                name: player.name,
                wonOrLost: player.won ? "Won" : "Lost",
                reason: player.won ? player.reasonWon : player.reasonLost,
                bgColor: color.rgbaString(),
                textColor: color.contrastingColor().rgbString(),
            }, $list);
        }

        this.$losers.show(this.$losers.html() !== "");

        if(this.$winners.html() === "") { // then there are no winners, it's a tie
            this._itemPartial({
                name: "Game Over -",
                wonOrLost: "Tie",
                reason: players[0].reasonLost, // for draws all players should have the same reasonLost
            }, this.$winners);
        }

        this.$element.removeClass("collapsed");
    },

    hide: function() {
        this.$element.addClass("collapsed");
    },
});

module.exports = GameOverScreen;
