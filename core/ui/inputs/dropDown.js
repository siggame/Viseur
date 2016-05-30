var $ = require("jquery");
var Classe = require("classe");
var BaseInput = require("./baseInput");
var partial = require("../../partial");

/**
 * @class DropDown - a select with options input
 */
var DropDown = Classe(BaseInput, {
    init: function(args) {
        BaseInput.init.apply(this, arguments);

        for(var i = 0; i < args.options.length; i++) {
            this._optionPartial({value: args.options[i]}, this.$element);
        }
    },

    _template: require("./dropDown.hbs"),
    _optionPartial: partial(require("./dropDownOption.hbs")),
});

module.exports = DropDown;
