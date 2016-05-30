var Classe = require("classe");
var partial = require("../partial");

/**
 * @class BaseElement - a wrapper for some HTML element(s)
 */
var BaseElement = Classe({
    init: function(args) {
        this.id = args.id;
        this.$parent = args.$parent;

        this.$element = this._partial(args, this.$parent);

        if(this.$parent) {
            this.$element.appendTo(this.$parent);
        }
    },

    _partial: function() {
        return partial(this._template).apply(partial, arguments);
    },

    _template: require("./baseElement.hbs"),
});

module.exports = BaseElement;
