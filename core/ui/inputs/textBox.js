var $ = require("jquery");
var Classe = require("classe");
var BaseInput = require("./baseInput");

/**
 * @class TextBox - a text input for strings
 */
var TextBox = Classe(BaseInput, {
    init: function(args) {
        BaseInput.init.call(this, $.extend({
            type: "text",
        }, args));
    },
});

module.exports = TextBox;
