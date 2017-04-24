var Classe = require("classe");
var BasePane = require("viseur/game/basePane");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// If you need to add additional requires, do so here
//<<-- /Creer-Merge: requires -->>

var Pane = Classe(BasePane, {
    init: function() {
        BasePane.init.apply(this, arguments);

        //<<-- Creer-Merge: style -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // If you need to init additional things, do so here
        //<<-- /Creer-Merge: style -->>
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

        //<<-- Creer-Merge: game-stats -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // push PaneStats onto the stats array here if you want to show additional values
        stats.push(
            {
                key: "currentForecast.intensity",
                icon: "fire",
            },
            {
                key: "currentForecast.direction",
                icon: "cloud",
            }
        );
        //<<-- /Creer-Merge: game-stats -->>

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

        //<<-- Creer-Merge: player-stats -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        stats.push(
            {
                key: "headquarters.health",
                icon: "heart",
            },
            {
                icon: "building-o",
                callback: function(s) {
                    return s.buildings.reduce(function(count, building) {
                        return count + (building.health === 0 ? 0 : 1);
                    }, 0);
                },
            },
            {
                key: "bribesRemaining",
                icon: "money",
            }
        );
        //<<-- /Creer-Merge: player-stats -->>

        return stats;
    },

    /**
     * Called when the game state updates. Stats are updated automatically, but you can update things here like the progress bars
     *
     * @param {GameState} state - the current(most) state of the game to update reflecting
     */
    update: function(state) {
        BasePane.update.apply(this, arguments);

        //<<-- Creer-Merge: update -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // you can update things for the pane here

        var scores = [];
        for(var i = 0; i < state.players.length; i++) {
            scores.push(state.players[i].headquarters.health);
        }

        this._setPlayersProgresses(scores);

        //<<-- /Creer-Merge: update -->>
    },


    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // add more functions for your pane here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = Pane;
