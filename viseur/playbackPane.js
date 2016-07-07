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

        this.$element.addClass("collapsed");

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

        this.playPauseButton.on("clicked", function() {
            self._emit("play-pause");
        });

        KeyObserver.on(" .up", function() { // space bar up
            self.playPauseButton.click();
        });

        this.nextButton.on("clicked", function() {
            self._emit("next");
        });

        KeyObserver.on("right arrow.up", function() {
            self.nextButton.click();
        });

        this.backButton.on("clicked", function() {
            self._emit("back");
        });

        KeyObserver.on("left arrow.up", function() {
            self.backButton.click();
        });

        this.fullscreenButton.on("clicked", function() {
            self._emit("fullscreen-enabled");
        });
    },

    _template: require("./playbackPane.hbs"),

    /**
     * Invoked when Viseur's gamelog is loaded
     *
     * @private
     */
    _gamelogLoaded: function(gamelog) {
        this._numberOfDeltas = gamelog.deltas.length;

        this.enable();
        this.playbackSlider.setValue(0);
        this.playbackSlider.setMax(gamelog.deltas.length - 1/1e10);

        this.$playbackTimeMax.html(gamelog.deltas.length - 1);

        this.$element.removeClass("collapsed");
    },

    /**
     * Invoked when the TimeManager's time changes, so we can update the slider and buttons
     *
     * @private
     */
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

    // NOTE: the speed slider does not slide linearly. Instead we follow y = 100x^2, with x being the slider's value, and y being the actual speed

    /**
     * Converts from the speed slider's value to the actual speed for the TimeManager
     *
     * @private
     * @param {number} x - the sliders current value
     * @returns {number} y - the TimeMangers speed based on the slider value x
     */
    _speedFromSlider: function(x) {
        var y = 100 * Math.pow(x, 2);
        return y;
    },

    /**
     * Converts from the speed of the TimeManager to the slider's value (reverse of y)
     *
     * @private
     * @param {number} y - the speed of the TimeManager
     * @returns {number} x - the speedSlider's value to represent y
     */
    _sliderFromSpeed: function(y) {
       var x = Math.sqrt(y/100);
       return x;
    },

    /**
     * Invoked when the speedSlider is dragged/changed.
     *
     * @private
     * @param {number} value - the new value of the playback slider, so we can set the speed based on that
     */
    _changePlaybackSpeed: function(value) {
        var newSpeed = this._speedFromSlider(-value);

        SettingsManager.set("viseur", "playback-speed", newSpeed);
    },

    /**
     * Invoked when the playback-speed setting is changed, so we can update the slider
     *
     * @private
     * @param {number} value - the new speed value set to the SettingManager, we will update the speedSLider according to it
     */
    _updateSpeedSlider: function(value) {
        sliderValue = this._sliderFromSpeed(value || SettingsManager.get("viseur", "playback-speed"));
        this.speedSlider.setValue(-sliderValue);
    },

    /**
     * Enables all the inputs
     */
    enable: function() {
        for(var i = 0 ; i < this.inputs.length; i++) {
            this.inputs[i].enable();
        }
    },

    /**
     * Disables all the inputs
     */
    disable: function() {
        for(var i = 0 ; i < this.inputs.length; i++) {
            this.inputs[i].disable();
        }
    },
});

module.exports = PlaybackPane;
