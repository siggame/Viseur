var Classe = require("classe");

var BaseGameObject = Classe({
    init: function(initialState, game) {
        this.game = game;
        this.renderer = game.renderer;
    },

    update: function(current, next) {
        this.current = current;
        this.next = next;
    },
});

module.exports = BaseGameObject;
