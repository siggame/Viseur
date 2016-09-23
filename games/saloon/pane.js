require("./pane.scss");

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

    //<<-- Creer-Merge: hbs -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    //_template: require("./pane.hbs"),
    //<<-- /Creer-Merge: hbs -->>

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // add more functions for your pane here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = Pane;
