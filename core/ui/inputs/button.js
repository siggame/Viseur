var Classe = require("classe");
var BaseInput = require("./baseInput");

/**
 * @class Button - a range input for numbers
 */
var Button = Classe(BaseInput, {
    init: function(args) {
        BaseInput.init.apply(this, arguments);

        if(args.text) {
            this.setText(args.text);
        }

        var self = this;
        this.$element.on("click", function() {
            self._emit("click");
        });
    },

    _template: require("./button.hbs"),

    setText: function(str) {
        this.$element.html(str);
    },
});

module.exports = Button;
