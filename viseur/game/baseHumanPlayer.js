var Classe = require("classe");
var Observable = require("core/observable");

/**
 * @class BaseHumanPlayer - the base class all HumanPlayers inherit from
 */
var BaseHumanPlayer = Classe(Observable, {
    init: function(game) {
        Observable.init.call(this);

        this.game = game;
        this._backOrders = []; // orders we were told to do before we knew our player
    },

    setPlayer: function(player) {
        this.player = player;

        while(this._backOrders.length > 0) {
            this.order.apply(this, this._backOrders.shift());
        }
    },

    /**
     * Order the human playing to do some
     * @param {string} orderName - the order (functionName) to execute
     * @param {Array} args - arguments to apply to the order function
     * @param {Function} callback - the function the humanPlayer should callback once done with the order
     */
    order: function(orderName, args, callback) {
        if(!this.player) { // then we have not been told our player, so back order it
            this._backOrders.push([orderName, args, callback]);
            return;
        }

        var orderFunction = this[orderName];

        if(!orderFunction) {
            throw new Error("No order '{}' found in humanPlayer".format(orderName));
        }

        this.game.pane.startTicking(this.player.next || this.player.current);

        var self = this;
        args.push(function(returned) {
            self.game.pane.stopTicking(this.player.next || self.player.current);
            callback(returned);
        });

        orderFunction.apply(this, args);
    },
});

module.exports = BaseHumanPlayer;
