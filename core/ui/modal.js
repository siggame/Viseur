require("./modal.scss");

var $ = require("jquery");
var Classe = require("classe");
var BaseElement = require("./baseElement");

/**
 * @class Modal - A modal that floats above the screen and blocks out all other input
 */
var Modal = Classe(BaseElement, {
    init: function(args) {
        BaseElement.init.apply(this, arguments);

        this.$content = $(".modal-content", this.$element);

        this.$element.addClass("hidden");
    },

    _template: require("./modal.hbs"),

    /**
     * Shows the modal with some element inside it
     *
     * @param   {$|string} $element - a jquery element, or a raw string to put inside this modal
     */
    show: function($element) {
        var self = this;
        this.$element.removeClass("hidden");
        setTimeout(function() {
            self.$element.addClass("show");
        }, 0);

        this.$content
            .html("")
            .append($element);

        delete this._showAfterHide;
    },

    /**
     * Hides the modal
     */
    hide: function() {
        var self = this;

        this.$element
            .removeClass("show")
            .onceTransitionEnds(function() {
                self.$element.addClass("hidden");
            });
    },
});

module.exports = Modal;
