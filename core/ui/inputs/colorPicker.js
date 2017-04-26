var Classe = require("classe");
var BaseInput = require("./baseInput");
var $ = require("jquery");
var Color = require("color");

/**
 * @class Number - a text input for numbers
 */
var ColorPicker = Classe(BaseInput, {
    /**
     * Initializes the Number Input
     *
     * @constructor
     * @param {Object} args - initialization args, can have min, max, and step
     */
    init: function(args) {
        args = $.extend({
            type: "color",
        }, args);

        BaseInput.init.call(this, args);
    },

    /**
     * Sets the value to a new color (if valid), otherwise defaults to white
     *
     * @override
     */
    setValue: function(newValue) {
        var parsedColor;
        try {
            parsedColor = Color(newValue);
        }
        catch(err) {
            // that color is invalid, reset to white
            parsedColor = Color("white");
        }

        newValue = parsedColor.hexString();

        BaseInput.setValue.apply(this, arguments);
    },
});

module.exports = ColorPicker;
