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

        if(args.options) {
            this.setOptions(args.options);
        }
    },

    _template: require("./dropDown.hbs"),
    _optionPartial: partial(require("./dropDownOption.hbs")),

    /**
     * Sets the value to an item in the drop down
     *
     * @override
     * @returns {boolean} true if the value was found and set to, false otherwise
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

    /**
     * Set the options for this Drop Down. Previous options are deleted.
     *
     * @param {Array.<String>} options [description]
     */
    setOptions: function(options) {
        if(options === this._options) {
            return;
        }

        this._options.length = 0;
        this.$element.html("");

        for(var i = 0; i < options.length; i++) {
            var opt = options[i];
            if(typeof(opt) === "string") {
                opt = { text: opt, value: opt };
            }

            this._options.push(opt);
            this._optionPartial(opt, this.$element);
        }

        this.setValue(this._options[0].value);
    },
});

module.exports = DropDown;
