require("./playbackPane.scss");

var humps = require("humps");
var Classe = require("classe");
var Observable = require("core/observable");
var BaseElement = require("core/ui/baseElement");
var inputs = require("core/ui/inputs");
var Visuer = require("./");

var playbackInputs = [
    { id: "playbackSlider", classe: inputs.Slider, location: "top" },
    { id: "playPauseButton", classe: inputs.Button, location: "bottomLeft" },
    { id: "backButton", classe: inputs.Button, location: "bottomLeft" },
    { id: "stopButton", classe: inputs.Button, location: "bottomLeft" },
    { id: "nextButton", classe: inputs.Button, location: "bottomLeft" },
    { id: "speedSlider", classe: inputs.Slider, location: "bottomRight" },
    { id: "fullscreenButton", classe: inputs.Button, location: "bottomRight" },
];

/**
 * @class PlaybackPane - handles all the playback controls and logic for the GUI
 */
var PlaybackPane = Classe(Observable, BaseElement, {
    init: function(args) {
        Observable.init.apply(this);
        args.id = args.id || "playback-pane";
        BaseElement.init.apply(this, arguments);

        this.locations = {
            top: this.$element.find(".playback-pane-top"),
            bottomLeft: this.$element.find(".playback-pane-bottom-left"),
            bottomRight: this.$element.find(".playback-pane-bottom-right"),
        };

        this.inputs = [];
        for(var i = 0; i < playbackInputs.length; i++) {
            var playbackInput = playbackInputs[i];
            var newInput = new playbackInput.classe({
                id: humps.decamelize(playbackInput.id, { separator: "-" }),
                $parent: this.locations[playbackInput.location],
                disabled: true,
            });

            this[playbackInput.id] = newInput;
            this.inputs.push(newInput);
        }

        var self = this;
        Visuer.once("gamelog-loaded", function(gamelog) {
            self.enable();
            self.playbackSlider.setValue(0);
            self.playbackSlider.setMax(gamelog.deltas.length);
        });

        Visuer.on("playing", function() {
            self.$element.addClass("playing");
        });

        Visuer.on("paused", function() {
            self.$element.removeClass("playing");
        });

        Visuer.on("time-updated", function(index, dt) {
            self.playbackSlider.setValue(index + dt);
        });


        // our events to emit

        this.playbackSlider.on("changed", function(value) {
            self._emit("playback-slide", value);
        });

        this.speedSlider.on("changed", function(value) {
            self._emit("speed-slide", value);
        });

        this.playPauseButton.on("click", function() {
            self._emit("play-pause");
        });

        this.nextButton.on("click", function() {
            self._emit("next");
        });

        this.backButton.on("click", function() {
            self._emit("back");
        });

        this.fullscreenButton.on("click", function() {
            self._emit("fullscreen-enabled");
        });
    },

    _template: require("./playbackPane.hbs"),

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
