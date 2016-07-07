var Classe = require("classe");
var Observable = require("core/observable");
var Timer = require("core/timer");
var SettingsManager = require("./settingsManager");
var Viseur = null;

/**
 * @class TimeManager - manages playback time and what the game state to show should look like
 */
var TimeManager = Classe(Observable, {
    init: function(maxIndex) {
        Viseur = require("./viseur");
        Observable.init.call(this);

        this._currentIndex = -1;
        this._timer = new Timer(SettingsManager.get("viseur", "playback-speed", 1000));

        var self = this;
        this._timer.on("finished", function() {
            self._ticked();
        });

        SettingsManager.on("viseur.playback-speed.changed", function(newSpeed) {
            self._timer.setSpeed(newSpeed);
        });

        Viseur.on("ready", function(game, gamelog) {
            self._ready(game, gamelog);
        });
    },

    /**
     * Invoked when Viseur is ready
     *
     * @private
     */
    _ready: function(game, gamelog) {
        var self = this;
        this.game = game;
        this._numberOfDeltas = gamelog.deltas.length;

        this._ticked(true);

        Viseur.gui.on("play-pause", function() {
            self._playPause();
        });

        Viseur.gui.on("next", function() {
            self._next();
        });

        Viseur.gui.on("back", function() {
            self._back();
        });

        Viseur.gui.on("playback-slide", function(value) {
            var index = Math.floor(value);
            var dt = value - index;
            self._pause(index, dt);
        });

        Viseur.on("gamelog-updated", function() {
            self._play();
        });
    },

    /**
     * Sets the current time to some index and dt
     *
     * @param {number} index - the current index, must be between [0, deltas.length]
     * @param {number} [dt=0] - the "tweening" between index and index + 1, must be between [0, 1)
     */
    setTime: function(index, dt) {
        var oldIndex = this._currentIndex;
        this._currentIndex = index;
        this._timer.setProgress(dt || 0);

        if(oldIndex !== index) {
            this._emit("new-index", index);
        }
    },

    /**
     * force plays the next animation
     */
    _play: function(index, dt) {
        if(arguments.length > 0) {
            this.setTime(index, dt);
        }

        if(!this._timer.isTicking()) {
            this._playPause();
        }
    },

    /**
     * if playing pause, if paused start playing
     *
     * @private
     */
    _playPause: function() {
        if(!this._timer.isTicking() && this._currentIndex === this._numberOfDeltas - 1 && this._timer.getProgress() > 0.99) { // wrap around
            this.setTime(0, 0);
        }

        var paused = this._timer.invertTicking();
        this._emit(paused ? "paused" : "playing");
    },

    /**
     * Invoked when the timer ticks, advacing the index by 1, and resetting dt to 0
     *
     * @private
     */
    _ticked: function(start) {
        this._currentIndex++;

        this._emit("new-index", this._currentIndex);

        if(!start && this._currentIndex < this._numberOfDeltas - 1) {
            this._timer.restart();
        }
        else {
            this._pause();
        }
    },

    /**
     * Returns the current time. Calling this does not effect the timer.
     *
     * @returns {Object} contains the current `index` and `dt`.
     */
    getCurrentTime: function() {
        return {
            index: this._currentIndex,
            dt: this._timer.getProgress(),
        };
    },

    /**
     * Sets the timer back. If playing pauses and reduces dt to 0, otherwise advances 1 index.
     *
     * @private
     */
    _back: function() {
        var index = this._currentIndex;
        if(this._timer.getProgress() === 0) {
            index--;
        }

        this._pause(index, 0);
    },

    /**
     * Advances to the next index, and pauses the timer.
     *
     * @private
     */
    _next: function() {
        var index = this._currentIndex;
        if(this._timer.getProgress() === 0) {
            index++;
        }

        this._pause(index, 0);
    },

    /**
     * Pauses the timer. Doe not call to pause as in a play/pause
     *
     * @private
     */
    _pause: function(index, dt) {
        this._timer.pause();

        if(index !== undefined) {
            this.setTime(index, dt);
        }

        this._emit("paused");
    },
});

module.exports = TimeManager;
