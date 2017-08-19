require("./gameOverScreen.scss");

var $ = require("jquery");
var Classe = require("classe");
var BaseElement = require("src/core/ui/baseElement");
var partial = require("src/core/partial");
var utils = require("src/core/utils");
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
        Viseur = require("src/viseur/"); // require here to avoid cycles

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
        if(!this._built) {
            this._buildItems();
        }

        this.$element.removeClass("collapsed");
    },

    hide: function() {
        this.$element.addClass("collapsed");
    },

    _buildItems: function() {
        this.$winners.html("");
        this.$losers.html("");

        this._$items = [];
        var playerState;
        for(var i = 0; i < this.game.players.length; i++) {
            var player = this.game.players[i];
            playerState = player.current || player.next;
            var color = player.getColor();

            var $list = (playerState.won ? this.$winners : this.$losers);
            this._$items.push(this._itemPartial({
                name: utils.escapeHTML(playerState.name),
                wonOrLost: playerState.won ? "Won" : "Lost",
                reason: playerState.won ? playerState.reasonWon : playerState.reasonLost,
                bgColor: color.clone().clearer(0.375).rgbaString(),
                textColor: color.contrastingColor().rgbString(),
            }, $list));
        }

        this.$losers.show(this.$losers.html() !== "");

        if(this.$winners.html() === "") { // then there are no winners, it's a tie
            this._itemPartial({
                name: "Game Over -",
                wonOrLost: "Tie",
                reason: playerState.reasonLost, // for draws all players should have the same reasonLost, so using the last one's reasonLost should be the same for any of them
            }, this.$winners);
        }

        this.recolor();

        this._built = true;
    },

    recolor: function() {
        if(!this._built) {
            return; // nothing to recolor... yet
        }

        for(var i = 0; i < this.game.players.length; i++) {
            var player = this.game.players[i];
            var color = player.getColor();

            this._$items[i].find(".bg-wrapper")
                .css("background-color", color.clone().clearer(0.375).rgbaString())
                .css("color", color.contrastingColor().rgbString());
        }
    },
});

module.exports = GameOverScreen;
