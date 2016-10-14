var Classe = require("classe");
var BasePane = require("viseur/game/basePane");

${merge("//", "requires", "// If you need to add additional requires, do so here")}

var Pane = Classe(BasePane, {
    init: function() {
        BasePane.init.apply(this, arguments);

${merge("        //", "style", "        // If you need to init additional things, do so here")}
    },

    /**
     * Gets the stats to show on the top bar of the pane, which tracks stats in the game
     *
     * @override
     * @param {GameState} state - the initial state of the game
     * @returns {Array.<PaneStat|string>} - All the PaneStats to display on this BasePane for the game. If a string is found it is tranformed to a PaneStat with the string being the `key`.
     */
    _getGameStats: function(state) {
        var stats = BasePane._getGameStats.apply(this, arguments);

${merge("        //", "game-stats", '        // push PaneStats onto the stats array here if you want to show additional values')}

        return stats;
    },

    /**
     * Gets the stats to show on each player pane, which tracks stats for that player
     *
     * @override
     * @param {GameState} state - the initial state of the game
     * @returns {Array.<PaneStat|string>} - All the PaneStats to display on this BasePane for the player. If a string is found it is tranformed to a PaneStat with the string being the `key`.
     */
    _getPlayerStats: function(state) {
        var stats = BasePane._getPlayerStats.apply(this, arguments);

${merge("        //", "player-stats", '        // push PaneStats onto the stats array here if you want to show additional values')}

        return stats;
    },

    /**
     * Called when the game state updates. Stats are updated automatically, but you can update things here like the progress bars
     *
     * @param {GameState} state - the current(most) state of the game to update reflecting
     */
    update: function(state) {
        BasePane.update.apply(this, arguments);

${merge("        //", "update", '        // you can update things for the pane here')}
    },


${merge("    //", "functions", '    // add more functions for your pane here')}

});

module.exports = Pane;
