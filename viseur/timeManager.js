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

    _ready: function(game, gamelog) {
        var self = this;
        this.game = game;
        this._numberOfDeltas = gamelog.deltas.length;

        this._ticked(true);

        Viseur.gui.on("play-pause", function() {
            var paused = self._timer.invertTicking();
            self._emit(paused ? "paused" : "playing");
        });

        Viseur.gui.on("pause", function() {
            self._timer.pause();
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
            self.setTime(index, dt);
        });
    },

    setTime: function(index, dt) {
        var oldIndex = this._currentIndex;
        this._currentIndex = index;
        this._timer.setProgress(dt);

        if(oldIndex !== index) {
            this._emit("new-index", index);
        }
    },

    _ticked: function(start) {
        this._currentIndex++;

        this._emit("new-index", this._currentIndex);

        if(!start && this._currentIndex < this._numberOfDeltas) {
            this._timer.restart();
        }
    },

    getCurrentTime: function() {
        return {
            index: this._currentIndex,
            dt: this._timer.getProgress(),
        };
    },
});

module.exports = TimeManager;
