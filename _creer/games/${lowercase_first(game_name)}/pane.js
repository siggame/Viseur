require("./pane.scss");

var Classe = require("classe");
var BasePane = require("viseur/game/basePane");

${merge("//", "requires", "// If you need to add additional requires, do so here")}

var Pane = Classe(BasePane, {
    init: function() {
        BasePane.init.apply(this, arguments);

${merge("        //", "style", "        // If you need to init additional things, do so here")}
    },

${merge("    //", "hbs", '    //_template: require("./pane.hbs"),')}

${merge("    //", "functions", '    // add more functions for your pane here')}

});

module.exports = Pane;
