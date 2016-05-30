var $ = require("jquery");
var Classe = require("classe");
var NumberInput = require("./number");

/**
 * @class Slider - a range input for numbers
 */
var Slider = Classe(NumberInput, {
    init: function(args) {
        NumberInput.init.call(this, $.extend({
            type: "range",
            step: "any"
        }, args));
    },
});

module.exports = Slider;
