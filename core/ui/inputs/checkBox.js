var $ = require("jquery");
var Classe = require("classe");
var BaseInput = require("./baseInput");

/**
 * @class CheckBox - a checkbox for booleans
 */
var CheckBox = Classe(BaseInput, {
    /**
     * Intialized the checkbox to true or false
     *
     * @constructor
     * @param {Object} args - initialization args, value should be true or false for checked
     */
    init: function(args) {
        BaseInput.init.call(this, $.extend({
            value: false,
            type: "checkbox",
        }, args));
    },

    /**
     * Sets if this has been pressed (true) or not (false)
     *
     * @override
     */
    setValue: function(newValue) {
        BaseInput.setValue.call(this, Boolean(newValue));
    },

    /**
     * Enforced that when clicked is a boolean
     *
     * @override
     */
    _updateElementValue: function() {
        this.$element.prop("checked", this._value);
    },

    /**
     * Gets if it is checked or not
     *
     * @override
     */
    _getElementValue: function() {
        return this.$element.prop("checked");
    },
});

module.exports = CheckBox;
