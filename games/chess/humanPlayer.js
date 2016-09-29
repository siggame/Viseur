var Classe = require("classe");
var BaseHumanPlayer = require("viseur/game/baseHumanPlayer");

var HumanPlayer = Classe(BaseHumanPlayer, {
    init: function(game) {
        BaseHumanPlayer.init.apply(this, arguments);

        this._endTurn = null; // callback to end turn
    },

    implimented: true,

    // YOU MUST invoke the callback at some time
    runTurn: function(callback) {
        this._endTurn = callback;
    },

    handleTileClicked: function(pos) {
        var selected = this.game.selectedPiece;

        if(!selected) {
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
});

module.exports = HumanPlayer;
