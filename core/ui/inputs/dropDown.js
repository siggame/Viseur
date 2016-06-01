var $ = require("jquery");
var Classe = require("classe");
var BaseInput = require("./baseInput");
var partial = require("../../partial");

/**
 * @class DropDown - a select with options input
 */
var DropDown = Classe(BaseInput, {
    init: function(args) {
        this._options = args.options;

        BaseInput.init.apply(this, arguments);

        for(var i = 0; i < this._options.length; i++) {
            this._optionPartial({value: this._options[i]}, this.$element);
        }

        this.setValue(this._options[0]);
    },

    _template: require("./dropDown.hbs"),
    _optionPartial: partial(require("./dropDownOption.hbs")),

    setValue: function(newValue) {
        if(this._options.contains(newValue)) {
            BaseInput.setValue.call(this, newValue);
            return true;
        }

        return false;
    },
});

module.exports = DropDown;
