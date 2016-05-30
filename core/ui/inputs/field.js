require("./field.scss");

var Classe = require("classe");
var BaseElement = require("../baseElement");

/**
 * @class Field - A wrapper for an Input that gives it a label
 */
var Field = Classe(BaseElement, {
    init: function(args) {
        BaseElement.init.apply(this, arguments);

        this.input = args.input;

        this.$element.append(this.input.$element);
    },

    _template: require("./field.hbs"),
});

module.exports = Field;
