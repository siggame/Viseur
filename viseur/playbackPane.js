require("./playbackPane.scss");

var $ = require("jquery");
var humps = require("humps");
var Classe = require("classe");
var Observable = require("core/observable");
var BaseElement = require("core/ui/baseElement");
var inputs = require("core/ui/inputs");
var Visuer = require("./viseur");
var SettingsManager = require("./settingsManager");
var KeyObserver = require("./keyObserver");

var playbackInputs = [
    { name: "playbackSlider", classe: inputs.Slider, location: "top", min: 0, step: "any" },
    { name: "playPauseButton", classe: inputs.Button, location: "bottomLeft" },
    { name: "backButton", classe: inputs.Button, location: "bottomLeft" },
    { name: "nextButton", classe: inputs.Button, location: "bottomLeft" },
    { name: "speedSlider", classe: inputs.Slider, location: "bottomRight", min: -10, max: -0.1, step: "any" },
    { name: "fullscreenButton", classe: inputs.Button, location: "bottomRight" },
];

/**
 * @class PlaybackPane - handles all the playback controls and logic for the GUI
 */
var PlaybackPane = Classe(Observable, BaseElement, {
    init: function(args) {
        Observable.init.apply(this);
        args.id = args.id || "playback-pane";
        BaseElement.init.apply(this, arguments);

        this.$playbackTimeCurrent = this.$element.find(".playback-time-current");
        this.$playbackTimeMax = this.$element.find(".playback-time-max");

        this.locations = {
            top: this.$element.find(".playback-pane-top"),
            bottomLeft: this.$element.find(".playback-pane-bottom-left"),
            bottomRight: this.$element.find(".playback-pane-bottom-right"),
        };

        this.inputs = [];
        for(var i = 0; i < playbackInputs.length; i++) {
            var playbackInput = playbackInputs[i];
            var newInput = new playbackInput.classe($.extend({
                id: humps.decamelize(playbackInput.name, { separator: "-" }),
                $parent: this.locations[playbackInput.location],
                disabled: true,
            }, playbackInput));

            this[playbackInput.name] = newInput;
            this.inputs.push(newInput);
        }

        var self = this;
        Visuer.once("gamelog-loaded", function(gamelog) {
            self._gamelogLoaded(gamelog);
        });

        Visuer.timeManager.on("playing", function() {
            self.$element.addClass("playing");
        });

        Visuer.timeManager.on("paused", function() {
            self.$element.removeClass("playing");
        });

        Visuer.on("time-updated", function(index, dt) {
            self._timeUpdated(index, dt);
        });


        // our events to emit

        this.playbackSlider.on("changed", function(value) {
            self._emit("playback-slide", value);
        });

        SettingsManager.on("viseur.playback-speed.changed", function(value) {
            self._updateSpeedSlider(value);
        });

        this._updateSpeedSlider();

        this.speedSlider.on("changed", function(value) {
            self._changePlaybackSpeed(value);
        });

        this.playPauseButton.on("click", function() {
            self._emit("play-pause");
        });

        KeyObserver.on(" .up", function() { // space bar up
            self.playPauseButton.click();
        });

        this.nextButton.on("click", function() {
            self._emit("next");
        });

        KeyObserver.on("right arrow.up", function() {
            self.nextButton.click();
        });

        this.backButton.on("click", function() {
            self._emit("back");
        });

        KeyObserver.on("left arrow.up", function() {
            self.backButton.click();
        });

        this.fullscreenButton.on("click", function() {
            self._emit("fullscreen-enabled");
        });
    },

    _template: require("./playbackPane.hbs"),

    _gamelogLoaded: function(gamelog) {
        this._numberOfDeltas = gamelog.deltas.length;

        this.enable();
        this.playbackSlider.setValue(0);
        this.playbackSlider.setMax(gamelog.deltas.length - 1/1e10);

        this.$playbackTimeMax.html(gamelog.deltas.length - 1);
    },

    _timeUpdated: function(index, dt) {
        this.$playbackTimeCurrent.html(index);
        this.playbackSlider.setValue(index + dt);

        if(index === 0 && dt === 0) {
            this.backButton.disable();
        }
        else {
            this.backButton.enable();
        }

        if(index >= this._numberOfDeltas - 1) {
            this.nextButton.disable();
        }
        else {
            this.nextButton.enable();
        }
    },

    _speedFromSlider: function(x) {
        var y = 100 * Math.pow(x, 2);
        return y;
    },

    _sliderFromSpeed: function(y) {
       var x = Math.sqrt(y/100);
       return x;
    },

    _changePlaybackSpeed: function(value) {
        var newSpeed = this._speedFromSlider(-value);

        SettingsManager.set("viseur", "playback-speed", newSpeed);
    },

    _updateSpeedSlider: function(value) {
        sliderValue = this._sliderFromSpeed(value || SettingsManager.get("viseur", "playback-speed"));
        this.speedSlider.setValue(-sliderValue);
    },

    enable: function() {
        for(var i = 0 ; i < this.inputs.length; i++) {
            this.inputs[i].enable();
        }
    },

    disable: function() {
        for(var i = 0 ; i < this.inputs.length; i++) {
            this.inputs[i].disable();
        }
    },
});

module.exports = PlaybackPane;
