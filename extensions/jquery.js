var jQuery = require("jquery");

var transitionEvents = "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend";

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

    goFullscreen: function() {
        var elem = this[0];

        if(elem.requestFullscreen) {
            elem.requestFullscreen();
        }
        else if(elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        else if(elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        }
        else if(elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }

        return this;
    }
});

jQuery.deepCopy = function(obj) {
    return jQuery.extend(true, {}, obj);
};

jQuery.exitFullscreen = function() {
    if(document.exitFullscreen) {
        document.exitFullscreen();
    }
    else if(document.msExitFullscreen) {
        document.msExitFullscreen();
    }
    else if(document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
};

window.$ = jQuery;
