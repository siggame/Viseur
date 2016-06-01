var $ = require("jquery");
var Classe = require("classe");
var BaseInput = require("./baseInput");

/**
 * @class CheckBox - a checkbox for booleans
 */
var CheckBox = Classe(BaseInput, {
    init: function(args) {
        BaseInput.init.call(this, $.extend({
            value: false,
            type: "checkbox"
        }, args));
    },

    /**
     * @override
     */
    setValue: function(newValue) {
        BaseInput.setValue.call(this, Boolean(newValue));
    },

    _updateElementValue: function() {
        this.$element.prop("checked", this._value);
    },

    _getElementValue: function() {
        return this.$element.prop("checked");
    },
});

module.exports = CheckBox;
