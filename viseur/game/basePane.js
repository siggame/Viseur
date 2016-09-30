require("./basePane.scss");

var dateFormat = require('dateformat');
var $ = require("jquery");
var Classe = require("classe");
var BaseElement = require("core/ui/baseElement");
var Timer = require("core/timer");
var Viseur = null;

/**
 * @class BasePane - the base class for all game panes, which are the HTML part of the game normally used to show player stats
 */
var BasePane = Classe(BaseElement, {
    init: function(game, initialState) {
        Viseur = require("viseur");

        var self = this;
        var playerIDs = [];

        for(var i = 0; i < initialState.players.length; i++) {
            playerIDs.push(initialState.players[i].id);
        }

        this.game = game;
        this._ticking = {
            timer: new Timer(),
        }; // used to tick down a player's time when in human playable mode

        this._ticking.timer.on("finished", function() {
            self._ticked();
        });

        BaseElement.init.call(this, {
            players: playerIDs,
            $parent: Viseur.gui.$gamePaneWrapper,
        });

        this.$element.addClass("game-" + this.game.name);

        this._$top = this.$element.find(".top-game-info");
        this._$currentTurn = this.$element.find(".current-turn");

        var $players = this.$element.find(".player");
        this._$players = {};
        for(i = 0; i < $players.length; i++) {
            var $player = $($players[i]);

            this._$players[playerIDs[i]] = {
                $element: $player,
                $name: $player.find(".player-name"),
                $time: $player.find(".player-time"),
                $reasonWon: $player.find(".player-reason-won"),
                $reasonLost: $player.find(".player-reason-lost"),
            };
        }
    },

    _template: require("./basePane.hbs"),

    /**
     * updates the base pane upon a new state
     */
    update: function() {
        var state = this.game.current || this.game.next;
        // update top
        var turn = state.currentTurn;
        if(turn !== undefined) {
            this._$currentTurn.html(turn);
        }

        // update players
        var players = state.players;
        for(var i = 0; i < players.length; i++) {
            var playerID = players[i].id;
            var player = state.gameObjects[playerID];

            var $player = this._$players[playerID];
            $player.$name.html(player.name);
            $player.$reasonWon.html(player.reasonWon);
            $player.$reasonLost.html(player.reasonLost);

            $player.$time.html(this._formatTimeRemaining(player.timeRemaining));

            $player.$element
                .toggleClass("current-player", state.currentPlayer.id === playerID)
                .css("background-image", 'url("viseur/programming-languages/{}.png")'.format(player.clientType.replace("#", "s").toLowerCase()));
        }
    },

    _formatTimeRemaining: function(timeRemaining) {
        var nsAsDate = new Date(Math.round(timeRemaining / 1000000)); // convert ns to ms, which is what Date() expects
        return dateFormat(nsAsDate, "MM:ss:l");
    },

    /**
     * Starts ticking the time down for a player (human client mode)
     *
     * @param {PlayerState} player - the player to tick for
     */
    startTicking: function(player) {
        var $player = this._$players[player.id];

        this._ticking.player = player;
        this._ticking.time = player.timeRemaining;

        this._ticking.timer.tick();
    },

    /**
     * Stops the player timer from ticking
     */
    stopTicking: function() {
        this._ticking.timer.pause();
        this._ticking.timer.setProgress(0);
    },

    /**
     * Invoked when the timer ticks once a second
     */
    _ticked: function() {
        if(this._ticking.player) {
            var $player = this._$players[this._ticking.player.id];
            this._ticking.time -= (1000 * 1000000); // 1000 ms elapsed on this tick

            $player.$time.html(this._formatTimeRemaining(this._ticking.time));

            this._ticking.timer.restart();
        }
    },
});

module.exports = BasePane;
