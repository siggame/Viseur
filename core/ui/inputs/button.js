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
            self.click();
        });
    },

    _template: require("./button.hbs"),

    /**
     * Sets the text on this button
     *
     * @param {string} str - the text to display on the button
     */
    setText: function(str) {
        this.$element.html(str);
    },

    /**
     * Emit a click
     */
    click: function() {
        this._emit("click");
    },
});

module.exports = Button;
