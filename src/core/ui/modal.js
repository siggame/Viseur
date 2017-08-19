require("./modal.scss");

var Classe = require("classe");
var BaseElement = require("./baseElement");

/**
 * @class Modal - A modal that floats above the screen and blocks out all other input
 */
var Modal = Classe(BaseElement, {
    init: function(args) {
        BaseElement.init.apply(this, arguments);

        this.$content = this.$element.find(".modal-content");
        this.$element.addClass("hidden");
    },

    _template: require("./modal.hbs"),

    /**
     * Shows the modal with some element inside it
     *
     * @param {$|string} $element - a jquery element, or a raw string to put inside this modal
     * @param {function} [callback] - callback to execute after showing (not after animation, but after show is invoked async)
     */
    show: function($element, callback) {
        var self = this;
        this.$element.removeClass("hidden");
        setTimeout(function() {
            self.$element.addClass("show");

            if(callback) {
                self.$element.onceTransitionEnds(callback);
            }
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
