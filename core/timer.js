var Classe = require("classe");
var Observable = require("core/observable");

/**
 * @class Timer - ticks at a custom rate to a number of steps
 */
var TimeManager = Classe(Observable, {
    init: function(speed) {
        Observable.init.call(this);

        this._lastProgress = 0;
        this._lastTime = null; // last time played
        this._timeout = null;

        this.setSpeed(Number(speed) || 1000);
    },

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

    restart: function() {
        this.setProgress(0);
        return this.tick();
    },

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
     * returns {boolean} true if now paused, false otherwise
     */
    invertTicking: function() {
        if(this.isTicking()) {
            this.pause();
            return true; // as we are no paused
        }
        else {
            this.tick();
            return false; // as we are now running
        }
    },

    isDone: function() {
        return this._lastProgress === 1;
    },
});

module.exports = TimeManager;
