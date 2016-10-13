require("./basePane.scss");

var dateFormat = require("dateformat");
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

        // clean shorthand player stats
        this._playerStats = this._getPlayerStats();
        var stat;
        for(i = 0; i < this._playerStats.length; i++) {
            stat = this._playerStats[i];

            if(typeof(stat) === "string") { // it is shorthand
                stat = { key: stat };
            }

            stat.title = stat.title || ("Player's " + stat.key);

            this._playerStats[i] = stat;
        }

        var $players = this.$element.find(".player");
        this._$players = {};
        for(i = 0; i < $players.length; i++) {
            var $player = $($players[i]);

            var player = {
                $element: $player,
                $stats: {},
            };

            for(var j = 0; j < this._playerStats.length; j++) {
                stat = this._playerStats[j];

                player.$stats[stat.key] = $("<li>")
                    .appendTo($player)
                    .addClass("player-" + stat.key)
                    .attr("title", stat.title)
                    .html(stat.key);
            }

            this._$players[playerIDs[i]] = player;
        }
    },

    _template: require("./basePane.hbs"),

    /**
     * @typedef {Object} PaneStat
     * @property {string} key - key within the `Player` or `Game` instances
     * @property {Function} format - function that formats the value of a key during display. Should take the value as an argument and return the formatted value
     */

    /**
     * Gets the player stats to show on this BasePane. Intended to be overridden by subclasses and extended
     *
     * @returns {Array.<PaneStat|string>} - All the PaneStats to display on this BasePane. If a string is found it is tranformed to a PaneStat with the string being the `key`.
     */
    _getPlayerStats: function() {
        return [
            "name",
            {
                key: "timeRemaining",
                title: "Time Reminaing (in min:sec:ms format)",
                format: function(timeRemaining) {
                    var nsAsDate = new Date(Math.round(timeRemaining / 1000000)); // convert ns to ms, which is what Date() expects
                    return dateFormat(nsAsDate, "MM:ss:l");
                },
            },
        ];
    },

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

            for(var j = 0; j < this._playerStats.length; j++) {
                var stat = this._playerStats[j];
                var value = player[stat.key];

                if(stat.format) {
                    value = stat.format(value);
                }

                $player.$stats[stat.key].html(value);
            }

            $player.$element
                .toggleClass("current-player", state.currentPlayer.id === playerID)
                .css("background-image", "url('viseur/images/{}.png')".format(player.clientType.replace("#", "s").toLowerCase())); // TODO: use webpack require() on image
        }
    },

    /**
     * Starts ticking the time down for a player (human client mode)
     *
     * @param {PlayerState} player - the player to tick for
     */
    startTicking: function(player) {
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

            $player.$timeRemaining.html(this._formatTimeRemaining(this._ticking.time));

            this._ticking.timer.restart();
        }
    },
});

module.exports = BasePane;
