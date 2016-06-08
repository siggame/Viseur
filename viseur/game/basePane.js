require("./basePane.scss");

var dateFormat = require('dateformat');
var $ = require("jquery");
var Classe = require("classe");
var BaseElement = require("core/ui/baseElement");
var Viseur = null;

var BasePane = Classe(BaseElement, {
    init: function(game, initialState) {
        Viseur = require("viseur");

        var playerIDs = [];

        for(var id in initialState.gameObjects) {
            if(initialState.gameObjects.hasOwnProperty(id)) {
                var gameObject = initialState.gameObjects[id];

                if(gameObject.gameObjectName === "Player") {
                    playerIDs.push(gameObject.id);
                }
            }
        }

        this.game = game;

        BaseElement.init.call(this, {
            players: playerIDs,
            $parent: Viseur.gui.$gamePaneWrapper,
        });

        var $players = this.$element.find(".player");
        this._$players = {};
        for(var i = 0; i < $players.length; i++) {
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

    update: function() {
        var players = this.game.current.players;
        for(var i = 0; i < players.length; i++) {
            var playerID = players[i].id;
            var player = this.game.current.gameObjects[playerID];

            var $player = this._$players[playerID];
            $player.$name.html(player.name);
            $player.$reasonWon.html(player.reasonWon);
            $player.$reasonLost.html(player.reasonLost);

            var nsAsDate = new Date(Math.round(player.timeRemaining / 1000000)); // convert ns to ms, which is what Date() expects
            $player.$time.html(dateFormat(nsAsDate, "MM:ss:l"));

            $player.$element.toggleClass("current-player", this.game.current.currentPlayer.id === playerID);
        }
    },
});

module.exports = BasePane;
