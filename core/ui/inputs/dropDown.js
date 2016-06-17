var $ = require("jquery");
var Classe = require("classe");
var BaseInput = require("./baseInput");
var partial = require("../../partial");

/**
 * @class DropDown - a select with options input
 */
var DropDown = Classe(BaseInput, {
    init: function(args) {
        this._options = [];

        BaseInput.init.apply(this, arguments);

        for(var i = 0; i < args.options.length; i++) {
            var opt = args.options[i];
            if(typeof(opt) === "string") {
                opt = { text: opt, value: opt };
            }

            this._options.push(opt);
            this._optionPartial(opt, this.$element);
        }

        this.setValue(this._options[0].value);
    },

    _template: require("./dropDown.hbs"),
    _optionPartial: partial(require("./dropDownOption.hbs")),

    /**
     * @override
     */
    setValue: function(newValue) {
        for(var i = 0; i < this._options.length; i++) {
            if(this._options[i].value === newValue) {
                BaseInput.setValue.call(this, newValue);
                return true;
            }
        }

        return false;
    },
});

module.exports = DropDown;
