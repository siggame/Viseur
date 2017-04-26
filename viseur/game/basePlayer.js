var Classe = require("classe");
var Color = require("color");
var SettingsManager = require("viseur/settingsManager");

/**
 * @class BasePlayer - the base functions all Players in a game share
 *
 * Note: this is a partial class, it must be inherited with BaseGameObject for GAME_NAME.Player instances
 */
var BasePlayer = Classe({
    init: function(initialState, game) {
        var state = game.current || game.next;
        for(var i = 0; i < state.players.length; i++) {
            if(state.players[i].id === this.id) {
                this.playersIndex = i;
                break;
            }
        }

        this.defaultColor = Color("white"); // should be overwritten by the parent BaseGame
    },

    /**
     * Gets the color assigned to this player by the game, including if overridden
     * @return {Color} the color assigned to this player by the game
     */
    getColor: function() {
        if(this.game.getSetting("custom-player-colors")) {
            // return their custom player color
            return Color(this.game.getSetting("player-color-" + this.playersIndex));
        }

        return this.defaultColor;
    },
});

module.exports = BasePlayer;
