var jQuery = require("jquery");

var transitionEvents = "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend"

jQuery.fn.extend({
    onceTransitionEnds: function(callback) {
        return this.one(transitionEvents, callback);
    },

    onTransitionsEnd: function(callback) {
        return this.on(transitionEvents, callback);
    },

    offTransitionsEnd: function(callback) {
        return this.off(transitionEvents, callback);
    },
});

jQuery.deepCopy = function(obj) {
    return jQuery.extend(true, {}, obj);
};

document.$ = jQuery;
