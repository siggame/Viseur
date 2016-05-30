var Classe = require("classe");
var BaseElement = require("core/ui/baseElement");

/**
 * @class HelpTab - The "Help" tab on the InfoPane
 */
var HelpTab = Classe(BaseElement, {
    _template: require("./helpTab.hbs"),
});

module.exports = HelpTab;
