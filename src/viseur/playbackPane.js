require("./playbackPane.scss");

var $ = require("jquery");
var humps = require("humps");
var Classe = require("classe");
var Observable = require("src/core/observable");
var BaseElement = require("src/core/ui/baseElement");
var inputs = require("src/core/ui/inputs");
var Visuer = require("./viseur");
var SettingsManager = require("./settingsManager");
var KeyObserver = require("./keyObserver");

var playbackInputs = [
    { name: "playbackSlider", classe: inputs.Slider, location: "top", min: 0, step: "any"},
    { name: "playPauseButton", classe: inputs.Button, location: "bottomLeft", title: "Plays/Pauses game playback" },
    { name: "backButton", classe: inputs.Button, location: "bottomLeft", title: "Moves playback back one step" },
    { name: "nextButton", classe: inputs.Button, location: "bottomLeft", title: "Moves playback forward one step" },
    { name: "deltasButton", classe: inputs.Button, location: "bottomRight", title: "Delta by Delta mode\nThe actual sequence of events is shown, but playback may take longer for turns with a large number of events" },
    { name: "turnsButton", classe: inputs.Button, location: "bottomRight", title: "Turn by Turn mode\nThe sequence of events is compressed so each GameObject does everything at the same time, which is not actually what happened. Playback speed increases with this enabled"},
    { name: "speedSlider", classe: inputs.Slider, location: "bottomRight", min: -10, max: -0.7, step: "any", title: "Playback speed\nLarger values to the right increase speed" },
    { name: "fullscreenButton", classe: inputs.Button, location: "bottomRight", title: "Enter Fullscreen" },
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
            }, playbackInput));

            this[playbackInput.name] = newInput;
            this.inputs.push(newInput);
        }

        this.disable();

        var self = this;
        Visuer.once("ready", function(game, gamelog) {
            self._viseurReady(gamelog);
        });

        Visuer.on("gamelog-updated", function(gamelog) {
            self._updatePlaybackSlider(gamelog);
        });

        Visuer.on("gamelog-finalized", function() {
            self.enable();
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


        // speed

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


        // play/pause

        this.playPauseButton.on("clicked", function() {
            self._emit("play-pause");
        });

        KeyObserver.on(" .up", function() { // space bar up, hence the ' '
            self.playPauseButton.click();
        });


        // next

        this.nextButton.on("clicked", function() {
            self._emit("next");
        });

        KeyObserver.on("right arrow.up", function() {
            self.nextButton.click();
        });


        // back

        this.backButton.on("clicked", function() {
            self._emit("back");
        });

        KeyObserver.on("left arrow.up", function() {
            self.backButton.click();
        });


        // fullscreen

        this.fullscreenButton.on("clicked", function() {
            self._emit("fullscreen-enabled");
        });


        // deltas/turns

        this.deltasButton.on("clicked", function() {
            if(SettingsManager.get("viseur", "playback-mode") !== "deltas") {
                SettingsManager.set("viseur", "playback-mode", "deltas");
            }
        });

        this.turnsButton.on("clicked", function() {
            if(SettingsManager.get("viseur", "playback-mode") !== "turns") {
                SettingsManager.set("viseur", "playback-mode", "turns");
            }
        });

        SettingsManager.onChanged("viseur", "playback-mode", function(value) {
            self._updatePlaybackMode(value);
        });

        this._updatePlaybackMode(SettingsManager.get("viseur", "playback-mode"));
    },

    _template: require("./playbackPane.hbs"),

    /**
     * Invoked when Viseur's gamelog is loaded
     *
     * @private
     * @param {Object} gamelog - the gamelog that was loaded
     */
    _viseurReady: function(gamelog) {
        var self = this;
        this._numberOfDeltas = gamelog.deltas.length;

        if(!gamelog.streaming) {
            this.enable();
        }
        else {
            this.speedSlider.enable(); // while streaming the gamelog only enable the speed slider
            Visuer.on("gamelog-finalized", function(finalGamelog) {
                self._numberOfDeltas = finalGamelog.deltas.length;
            });
        }

        this.playbackSlider.setValue(0);
        this._updatePlaybackSlider(gamelog);

        this.$element.removeClass("collapsed");
    },

    /**
     * Invoked when the gamelog's number of deltas is known or changes
     *
     * @private
     * @param {Object} gamelog - the gamelog to get info from
     */
    _updatePlaybackSlider: function(gamelog) {
        this.playbackSlider.setMax(gamelog.deltas.length - 1/1e10);

        this.$playbackTimeMax.html(gamelog.deltas.length - 1);
    },

    _updatePlaybackMode: function(mode) {
        mode = mode.toLowerCase();
        this.turnsButton.$element.toggleClass("active", mode === "turns");
        this.deltasButton.$element.toggleClass("active", mode === "deltas");
    },

    /**
     * Invoked when the TimeManager's time changes, so we can update the slider and buttons
     *
     * @private
     * @param {number} index - the index that was updated to
     * @param {number} dt - the dt number [0, 1) that was updated
     */
    _timeUpdated: function(index, dt) {
        this.$playbackTimeCurrent.html(index);
        this.playbackSlider.setValue(index + dt);

        if(this.isEnabled()) {
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
        var sliderValue = this._sliderFromSpeed(value || SettingsManager.get("viseur", "playback-speed"));
        this.speedSlider.setValue(-sliderValue);
    },

    /**
     * Enables all the inputs
     */
    enable: function() {
        this._disabled = false;
        for(var i = 0 ; i < this.inputs.length; i++) {
            this.inputs[i].enable();
        }
    },

    /**
     * Disables all the inputs
     */
    disable: function() {
        this._disabled = true;
        for(var i = 0 ; i < this.inputs.length; i++) {
            this.inputs[i].disable();
        }
    },

    /**
     * Checks if the playback pane is enabled (playback can be manipulated). SHould be disabled during streaming gamelogs
     *
     * @returns {Boolean} true if enabled, false otherwise
     */
    isEnabled: function() {
        return !this._disabled;
    },
});

module.exports = PlaybackPane;