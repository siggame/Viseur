var Classe = require("classe");
var Observable = require("src/core/observable");

/**
 * @class Timer - ticks at a custom rate to a number of steps
 */
var Timer = Classe(Observable, {
    init: function(speed) {
        Observable.init.call(this);

        this._lastProgress = 0;
        this._lastTime = null; // last time played
        this._timeout = null;

        this.setSpeed(Number(speed) || 1000);
    },

    /**
     * Sets the ticking speed of the timer, in ms
     *
     * @param {number} speed - the speed to tick at, in ms. Current speed will be recalculated
     */
    setSpeed: function(speed) {
        var wasTicking = this.isTicking();

        if(wasTicking) {
            this.pause();
        }

        this._speed = Math.max(Number(speed) || 0, 1);

        if(wasTicking) {
            this.tick();
        }
    },

    /**
     * sets the progress (how far it is to finishing)
     *
     * @param {number} time - must be between [0, 1], with 0 being no progress at all, 0.5 being half, etc.
     */
    setProgress: function(time) {
        var wasTicking = this.isTicking();
        if(wasTicking) {
            this.pause();
        }

        this._lastProgress = Math.clamp(time, 0, 1);

        if(wasTicking) {
            this.tick();
        }
    },

    /**
     * restarts the timer, restting progress to 0 then starting it back up
     * @returns {boolean} - true if started ticking, false if already ticking so this did nothing
     */
    restart: function() {
        this.setProgress(0);
        return this.tick();
    },

    /**
     * Starts ticking, taking saved progress into account
     *
     * @returns {boolean} - true if started ticking, false if already ticking so this did nothing
     */
    tick: function() {
        if(this._timeout || this._lastProgress >= 1) {
            return false;
        }

        var self = this;
        this._lastTime = new Date().getTime();
        this._timeout = setTimeout(function() {
            self.pause();
            self._emit("finished");
        }, (1 - this.getProgress()) * this._speed);

        return true;
    },

    /**
     * Checks if this timer is already ticking
     *
     * @returns {boolean} - true if ticking, false otherwise
     */
    isTicking: function() {
        return this._timeout !== null;
    },

    /**
     * Pauses the timer
     *
     * @returns {boolean} true if the timer was paused, false if it was not paused because it was not playing
     */
    pause: function() {
        if(!this.isTicking()) {
            return false;
        }

        clearTimeout(this._timeout);

        this._lastProgress = this.getProgress();
        this._timeout = null;

        return true;
    },

    /**
     * Gets how far this is into it's time, will be between [0, 1]
     *
     * @returns {number} - the current progress, a number between [0, 1]
     */
    getProgress: function() {
        if(!this.isTicking()) {
            return this._lastProgress;
        }

        // otherwise we need to calculate it
        var nowTime = new Date().getTime();
        var timeDiff = nowTime - this._lastTime;
        var percentDone = timeDiff / this._speed;

        return Math.min(this._lastProgress + percentDone, 1);
    },

    /**
     * Starts ticking if paused, pauses if ticking
     *
     * @returns {boolean} - true if now paused, false otherwise
     */
    invertTicking: function() {
        if(this.isTicking()) {
            this.pause();
            return true; // as we are not paused
        }
        else {
            this.tick();
            return false; // as we are now running
        }
    },

    /**
     * checks if the timer is done (progress is 1)
     *
     * @returns {boolean} - true if done progressing, false otherwise
     */
    isDone: function() {
        return this._lastProgress === 1;
    },
});

module.exports = Timer;
