var Classe = require("classe");
var Observable = require("core/observable");

/**
 * @class TimeManager - manages playback time and what the game state to show should look like
 */
var TimeManager = Classe(Observable, {
    init: function(maxIndex) {
        Observable.init.call(this);

        this.speed = 1000; // ms per delta
        this.currentIndex = 0;
        this.dt = 0; // how far into current index, [0-1]

        if(maxIndex !== undefined) {
            this.setMaxIndex(maxIndex);
        }
    },

    setSpeed: function(speed) {
        this.speed = Math.max(0, speed);
    },

    setTime: function(index, dt) {
        var diff = (this.currentIndex + this.dt) - (index - dt);
        this._addTime(diff);
    },

    setMaxIndex: function(newMaxIndex) {
        this.pause();

        this.maxIndex = Math.max(0, newMaxIndex);
    },

    /**
     * Starts the timer
     *
     * @returns {boolean} true if the timer was started, false if it was already started and this did nothing
     */
    start: function() {
        var self = this;
        if(!this._interval) {
            this._interval = setInterval(function() {
                var currentTime = new Date().getTime();
                if(!self._lastTime) {
                    self._lastTime = currentTime;
                    return;
                }

                var timeDiff = currentTime - self._lastTime;
                var dt = timeDiff / self.speed;

                self._addTime(dt);

                if(self.currentIndex === self.maxIndex) {
                    self.pause();
                }

                self._lastTime = currentTime;
            }, 0);

            return true;
        }

        return false;
    },

    _addTime: function(dt) {
        var oldIndex = this.currentIndex;
        var newTime = Math.clamp(this.currentIndex + this.dt + dt, 0, this.maxIndex);

        this.currentIndex = Math.floor(newTime);
        this.dt = newTime - this.currentIndex;

        this._emit("updated", this.currentIndex, this.dt);

        if(this.currentIndex !== oldIndex) {
            this._emit("new-index", this.currentIndex);
        }
    },

    /**
     * Pauses the timer
     *
     * @returns {boolean} true if the timer was paused, false if it was not paused because it was not playing
     */
    pause: function() {
        delete this._lastTime;

        if(this._interval) {
            clearInterval(this._interval);
            delete this._interval;
            return true;
        }

        return false;
    },

    /**
     * returns if this timer is paused (not running)
     *
     * @returns {boolean} true if paused, false if running (not paused)
     */
    isPaused: function() {
        return !this._interval;
    },

    /**
     * Pauses, and advances the index to the next index
     */
    next: function() {
        this.pause();

        this._addTime(1 - this.dt);
    },

        /**
     * Pauses, and moves back the index to the previous one
     */
    back: function() {
        this.pause();

        var back = -1;
        if(this.dt > 0) {
            back = -this.dt;
        }

        this._addTime(back);
    },

    /**
     * Plays if paused, pauses if playing
     *
     * returns {boolean} true if now paused, false otherwise
     */
    invertPause: function() {
        if(this.isPaused()) {
            this.start();
            return false; // as we are now running
        }
        else {
            this.pause();
            return true; // as we are no paused
        }
    },
});

module.exports = TimeManager;
