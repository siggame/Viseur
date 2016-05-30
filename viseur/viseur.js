var $ = require("jquery");
var queryString = require("query-string");
var Classe = require("classe");
var Observable = require("core/observable");
var Parser = require("./parser");
var Renderer = require("./renderer/");
var Timer = require("core/timer");
var SettingsManager = require("./settingsManager");

var Viseur = Classe(Observable, {
    /**
     * A hackish way of initializing itself after being required, as being a singleton others requiring it would cause cyclical rferences otherwise
     */
    start: function() {
        var GUI = require("./gui");
        this._timer = new Timer(1000, 1);
        this.gui = new GUI({
            $parent: $("#main"),
        });

        var self = this;
        this.gui.on("play-pause", function() {
            var paused = self._timer.invertPause();
            self._emit(paused ? "paused" : "playing");
        });

        this.gui.on("pause", function() {
            self._timer.pause();
        });

        this.gui.on("next", function() {
            self._timer.next();
        });

        this.gui.on("back", function() {
            self._timer.back();
        });

        this.gui.on("playback-slide", function(value) {
            self._timer.setTime(value);
        });

        this.gui.on("speed-slide", function(value) {
            selfs._timer.setSpeed(value);
        });

        this._timer.on("ticked", function(time) {
            var index = Math.floor(time);
            var dt = time - index;
            self._updateCurrentState(index, dt);
            self._emit("time-updated", index, dt);
        });

        this.renderer = new Renderer({
            $parent: this.gui.$rendererWrapper,
        });

        this.gui.on("resized", function(width, height, rendererHeight) {
            self.renderer.resize(width, rendererHeight);
        });

        this.gui.resize();

        this.renderer.on("rendering", function() {
            if(self.game) {
                var currentTime = self._timer.getCurrentTime();
                var index = Math.floor(currentTime);
                var dt = currentTime - index;
                self.game.render(index, dt);
            }
        });

        this._parseURL();
    },

    _games: require("games/"),

    _parseURL: function() {
        this.urlParms = queryString.parse(location.search);

        var logUrl = this.urlParms.log || this.urlParms.logUrl || this.urlParms.logURL;
        if(logUrl) {
            this.gui.modalMessage("Loading remote gamelog");
            var self = this;
            $.ajax({
                dataType: "json",
                url: logUrl,
                success: function(data) {
                    self.gui.modalMessage("Initializing Visualizer.");
                    self._gamelogLoaded(data);
                },
                error: function() {
                    self.gui.modalError("Error loading remote gamelog.");
                },
            });
        }
    },

    _gamelogLoaded: function(gamelog, callback) {
        this._rawGamelog = gamelog;
        this._parser = new Parser(gamelog.constants);
        this._timer.setMaxTime(gamelog.deltas.length);

        this._initGame(gamelog.gameName);

        this._emit("gamelog-loaded", gamelog);

        this._mergedDelta = {
            index: -1,
            currentState: {},
            nextState: this._parser.mergeDelta({}, gamelog.deltas[0].game),
        };
        this._updateCurrentState(0, 0);

        if(callback) {
            callback();
        }
    },

    _updateCurrentState: function(index, dt) {
        if(index < this._mergedDelta.index) {
            throw new Error("Cannot merge deltas backwards!");
        }

        var d = this._mergedDelta;
        var deltas = this._rawGamelog.deltas;

        if(this._timer.isDone()) {
            return;
        }

        var indexChanged = index !== d.index;

        while(index > this._mergedDelta.index) { // merge deltas till we are up to date
            d.index++;

            d.currentState = this._parser.mergeDelta(d.currentState, deltas[d.index].game);
            if(deltas[d.index + 1]) { // if there is a next state (not at the end)
                d.nextState = this._parser.mergeDelta(d.nextState, deltas[d.index + 1].game);
            }
        }

        if(indexChanged) {
            this._currentState = $.extend({}, deltas[d.index], {
                game: d.currentState,
                nextGame: d.nextState,
            });

            this._emit("state-changed", this._currentState);
        }
    },

    getCurrentState: function() {
        return this._currentState;
    },

    _initGame: function(gameName) {
        var gameNamespace = this._games[gameName];

        if(!gameNamespace) {
            throw new Error("Cannot load data for game '{}'.".format(gameClass));
        }

        this.game = new gameNamespace.Game();

        var textures = {};

        for(var key in this.game.namespace.textures) {
            if(this.game.namespace.textures.hasOwnProperty(key)) {
                textures[key] = "games/" + this.game.namespace.dir + "/textures/" + this.game.namespace.textures[key];
            }
        }
        var self = this;
        this.renderer.loadTextures(textures, function() {
            self._initialized();
        });
    },

    _initialized: function() {
        this.gui.hideModal();
        this._emit("initialized");
    },
});

module.exports = new Viseur(); // singleton
