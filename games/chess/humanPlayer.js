// This is where you build your the Human player interactions with Viseur for the Chess game.

var Class = require("classe");
var BaseHumanPlayer = require("viseur/game/baseHumanPlayer");

// <<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between creer runs
// <<-- /Creer-Merge: requires -->>

/**
 * @class
 * @classdesc This is the class to play the Chess game as a human. This is similar to building an "AI", but you need to query the human player for things and then callback actions.
 */
var HumanPlayer = Class(BaseHumanPlayer, {
    init: function() {
        BaseHumanPlayer.init.apply(this, arguments);

        // <<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this._endTurn = null; // callback to end turn

        // <<-- /Creer-Merge: init -->>
    },

    /**
     * Set this to true if you have coded the logic to make this human playable. otherwise leave it as false if you don't plan to fill this out.
     *
     * @static
     * @type {boolean}
     */
    // <<-- Creer-Merge: implimented -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    implimented: true,
    // <<-- /Creer-Merge: implimented -->>



    // Orders: things the game server tells this player to do \
    /**
     * This is called every time it is this AI.player's turn.
     *
     * @param {function} callback - The callback function, which acts as a return. When you are done with the order your MUST invoke this, and pass the 'return' value back.
     *    The callback should pass as the first arg: {boolean} - Represents if you want to end your turn. True means end your turn, False means to keep your turn going and re-call this function.
     */
    runTurn: function(callback) {
        // <<-- Creer-Merge: runTurn -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this._endTurn = callback;

        // <<-- /Creer-Merge: runTurn -->>
    },



    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    handleTileClicked: function(pos) {
        var selected = this.game.selectedPiece;

        // if nothing is selected, or it's not my turn
        if(!selected || !this._endTurn) {
            return false;
        }

        var state = selected.current || selected.next;
        var moves = this.game.validMoves;

        for(var i = 0; i < moves.length; i++) {
            var move = moves[i];
            if(move.to === pos && move.from === (state.file + state.rank)) {
                selected.move(move.to[0], parseInt(move.to[1]), "Queen");
                this._endTurn(true);
                this._endTurn = null;
                return true;
            }
        }

        return false;
    },

    //<<-- /Creer-Merge: functions -->>

});

module.exports = HumanPlayer;
