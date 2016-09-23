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

        var self = this;
        this.$element.on("keypress", function(e) {
            if(e.which === 13) { // enter key
                self._emit("submitted", self.getValue());
            }
        });

        if(args.placeholder) {
            this.$element.attr("placeholder", args.placeholder);
        }
    },
});

module.exports = TextBox;
