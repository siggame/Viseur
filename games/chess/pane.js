require("./pane.scss");

var Classe = require("classe");
var BasePane = require("viseur/game/basePane");

var Pane = Classe(BasePane, {
    init: function() {
        BasePane.init.apply(this, arguments);
    },

    //_template: require("./pane.hbs"),
});

module.exports = Pane;
