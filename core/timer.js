var Classe = require("classe");
var Observable = require("core/observable");

/**
 * @class Timer - ticks at a custom rate to a number of steps
 */
var TimeManager = Classe(Observable, {
    init: function(speed, maxTime) {
        Observable.init.call(this);

        this._currentTime = 0;
        this._lastTime = null; // last time played
        this._timeout = null;

        this.setSpeed(Number(speed) || 1000);
        this.setMaxTime(Number(maxTime) || 1);
    },

    setSpeed: function(speed) {
        var wasPlaying = this.isPlaying();

        if(wasPlaying) {
            this.pause();
        }

        this._speed = Math.max(Number(speed) || 0, 1);

        if(wasPlaying) {
            this.play();
        }
    },

    setTime: function(time) {
        var wasPlaying = this.isPlaying();
        if(wasPlaying) {
            this.pause();
        }

        this._currentTime = Math.clamp(time, 0, this._maxTime);

        if(wasPlaying) {
            this.play();
        }
    },

    setMaxTime: function(time) {
        this._maxTime = Math.max(Number(time) || 0, 1);
    },

    play: function() {
        if(this._timeout) {
            return false;
        }

        if(this.currentTime === this._maxTime) {
            return false;
        }

        var self = this;
        this._lastTime = new Date().getTime();
        this._timeout = setTimeout(function() {
            self._ticked();
        }, (1 - this._getStepPercentDone()) * this._speed);

        return true;
    },

    isPlaying: function() {
        return this._timeout !== null;
    },

    _ticked: function() {
        this._currentTime++;
        this._timeout = null;

        this._emit("ticked", this._currentTime);

        if(!this.isDone()) {
            this.play();
        }
        else {
            this._currentTime = this._maxTime - 1/1e10;
        }
    },

    _getStepPercentDone: function() {
        return this._currentTime - Math.floor(this._currentTime);
    },

    /**
     * Pauses the timer
     *
     * @returns {boolean} true if the timer was paused, false if it was not paused because it was not playing
     */
    pause: function() {
        if(!this.isPlaying()) {
            return false;
        }

        clearTimeout(this._timeout);

        this._currentTime = this.getCurrentTime();
        this._timeout = null;

        return true;
    },

    getCurrentTime: function() {
        if(!this.isPlaying()) {
            return this._currentTime;
        }

        // otherwise we need to calculate it
        var nowTime = new Date().getTime();
        var timeDiff = nowTime - this._lastTime;
        var percentDone = timeDiff / this._speed;

        return this._currentTime + percentDone;
    },

    /**
     * Pauses, and advances the index to the next index
     */
    next: function() {
        this.pause();

        var percent = this._getStepPercentDone();
        this._currentTime += 1 - percent;
        this._emit("ticked", this._currentTime);
    },

        /**
     * Pauses, and moves back the index to the previous one
     */
    back: function() {
        this.pause();

        var percent = this._getStepPercentDone();
        this._currentTime -= 1 - percent;
        this._emit("ticked", this.currentTime);
    },

    /**
     * Plays if paused, pauses if playing
     *
     * returns {boolean} true if now paused, false otherwise
     */
    invertPause: function() {
        if(this.isPlaying()) {
            this.pause();
            return true; // as we are no paused
        }
        else {
            this.play();
            return false; // as we are now running
        }
    },

    isDone: function() {
        return this._currentTime >= this._maxTime;
    },
});

module.exports = TimeManager;
