var Classe = require("classe");

/**
 * @class Observable - the basic implimentation of a publication/subscription system, similar to JavaScript's EventListener paradigm
 */
var Observable = Classe({
    init: function() {
        this._observableEvents = {};
    },

    /**
     * emits an event, calling all callbacks
     *
     * @param {string|Array} event - the event name to emit as a string, or an array of string events to emit
     */
    _emit: function(event /*, args... */) {
        var eventNames = Array.isArray(event) ? event : [ event ];
        var events = eventNames.concat("*"); // always emit to the wildcard (all) event

        for(var e = 0; e < events.length; e++) {
            var eventName = events[e];

            var callbacks = this._observableEvents[eventName];
            if(callbacks) {
                var args = [];
                for(var i = 1; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }

                if(eventName === "*") {
                    args.unshift(eventNames);
                }

                callbacks = callbacks.clone(); // so that the array does not resize during loop
                for(i = 0; i < callbacks.length; i++) {
                    var callback = callbacks[i];
                    callback.apply(callback, args);
                }
            }
        }
    },

    /**
     * Adds an Observation callback on emitted events
     *
     * @param {...string} eventName - the event to observe, should be a string "event", or many events "event1 event2"
     * @param {function} callback - the callback function to run on event
     */
    on: function(/* ...eventNames, callback */) {
        var events = Array.from(arguments);
        var callback = events.pop();
        for(var i = 0; i < events.length; i++) {
            var eventName = events[i];
            this._observableEvents[eventName] = this._observableEvents[eventName] || [];
            this._observableEvents[eventName].push(callback);
        }
    },

    /**
     * Removes a callback from an event
     *
     * @param {string} eventName - the event to observe
     * @param {function} callback - the callback function to run on event
     * @returns {boolean} true if successfully removed the observation, false otherwise
     */
    off: function(eventName, callback) {
        if(this._observableEvents[eventName]) {
            var callbacks = this._observableEvents[eventName];
            var index = callbacks.indexOf(callback);
            if(index > -1) {
                callbacks.splice(index, 1);
                return true;
            }
        }

        return false;
    },

    /**
     * A simple hanlder for on to happen once, then calls off
     *
     * @see Observable.on
     */
    once: function(eventName, callback) {
        var self = this;
        this.on(eventName, function(/*  */) {
            self.off(eventName, this);
            callback.apply(callback, arguments);
        });
    },

    /**
     * Observes all events from the otherObseravle and emits them as an event of this
     *
     * @param {Obserable} otherObseravle - the obseravle you want to act as a proxy to
     */
    proxy: function(otherObservable) {
        var self = this;
        otherObservable.on("*", function(/* arguments */) {
            self._emit.apply(self, arguments); // arguments will be what the event(s) emited, that we will re-emit
        });
    },
});

module.exports = Observable;
