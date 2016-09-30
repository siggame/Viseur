// This is where you build your the Human player interactions with Viseur for the Saloon game.

var Class = require("classe");
var BaseHumanPlayer = require("viseur/game/baseHumanPlayer");

// <<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between creer runs
// <<-- /Creer-Merge: requires -->>

/**
 * @class
 * @classdesc This is the class to play the Saloon game as a human. This is similar to building an "AI", but you need to query the human player for things and then callback actions.
 */
var HumanPlayer = Class(BaseHumanPlayer, {
    init: function() {
        BaseHumanPlayer.init.apply(this, arguments);

        // <<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // initialize variables here
        // <<-- /Creer-Merge: init -->>
    },

    /**
     * Set this to true if you have coded the logic to make this human playable. otherwise leave it as false if you don't plan to fill this out.
     *
     * @static
     */
    // <<-- Creer-Merge: implimented -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    implimented: false,
    // <<-- /Creer-Merge: implimented -->>



     //--- Orders: things the game server tells this player to do --- \
    /**
     * This is called every time it is this AI.player's turn.
     *
     * @param {function} callback - The callback function, which acts as a return. When you are done with the order your MUST invoke this, and pass the 'return' value back.
     *    The callback should pass as the first arg: {boolean} - Represents if you want to end your turn. True means end your turn, False means to keep your turn going and re-call this function.
     */
    runTurn: function(callback) {
        // <<-- Creer-Merge: runTurn -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // Put your game logic here for runTurn
        // <<-- /Creer-Merge: runTurn -->>
    },



    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add for the HumanPlayer
    //<<-- /Creer-Merge: functions -->>

});

module.exports = HumanPlayer;
