var $ = require("jquery");
var queryString = require("query-string");
var Classe = require("classe");
var Observable = require("core/observable");
var Parser = require("./parser");
var Renderer = require("./renderer/");
var TimeManager = require("./timeManager");
var SettingsManager = require("./settingsManager");
var Joueur = require("./joueur");

var Viseur = Classe(Observable, {
    /**
     * A hackish way of initializing itself after being required, as being a singleton others requiring it would cause cyclical rferences otherwise
     */
    start: function() {
        var GUI = require("./gui");

        this.timeManager = new TimeManager();

        this.gui = new GUI({
            $parent: $("#main"),
        });

        var self = this;

        this.timeManager.on("new-index", function(index) {
            self._updateCurrentState(index);
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
                var c = self.timeManager.getCurrentTime();
                self._emit("time-updated", c.index, c.dt);
                self.game.render(c.index, c.dt);
            }
        });

        this._parseURL();
    },

    _games: require("games/"),

    /**
     * parses URL parameters and does whatever they do, ingores unknown url parms.
     *
     * @private
     */
    _parseURL: function() {
        var self = this;
        this.urlParms = queryString.parse(location.search);

        var logUrl = this.urlParms.log || this.urlParms.logUrl || this.urlParms.logURL;
        if(logUrl) {
            this.gui.modalMessage("Loading remote gamelog");
            this._emit("gamelog-is-remote", logUrl);

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

    /**
     * Called once a gamelog is loaded
     *
     * @private
     * @param {Object} the deserialized JSON object that is the FULL gamelog
     */
    _gamelogLoaded: function(gamelog) {
        this._rawGamelog = gamelog;
        this._parser = new Parser(gamelog.constants);

        this._emit("gamelog-loaded", gamelog);

        this._mergedDelta = {
            index: -1,
            currentState: {},
            nextState: this._parser.mergeDelta({}, gamelog.deltas[0].game),
        };
        this._updateCurrentState(0, 0);

        this._initGame(gamelog.gameName);
    },

    /**
     * Brings the current state & next state to the one at the specificed index. If the current and passed in indexes are far apart this operation can take a decent chunk of time...
     *
     * @param {number} index - the new states index, must be between [0, deltas.length]
     */
    _updateCurrentState: function(index) {
        var d = this._mergedDelta;
        var deltas = this._rawGamelog.deltas;
        var indexChanged = index !== d.index;

        // if increasing index...
        while(index > d.index) {
            d.index++;

            if(deltas[d.index] && !deltas[d.index].reversed) {
                deltas[d.index].reversed = this._parser.createReverseDelta(d.currentState, deltas[d.index].game);
            }

            if(deltas[d.index] && deltas[d.index + 1] && !deltas[d.index + 1].reversed) {
                deltas[d.index + 1].reversed = this._parser.createReverseDelta(d.nextState, deltas[d.index + 1].game);
            }

            //d.index++;

            d.currentState = this._parser.mergeDelta(d.currentState, deltas[d.index].game);
            if(deltas[d.index + 1]) { // if there is a next state (not at the end)
                d.nextState = this._parser.mergeDelta(d.nextState, deltas[d.index + 1].game);
            }
        }

        // if decreasing index...
        while(index < d.index) {
            //d.index--;

            var r = deltas[d.index] && deltas[d.index].reversed;
            var r2 = deltas[d.index + 1] && deltas[d.index + 1].reversed;

            if(r) {
                d.currentState = this._parser.mergeDelta(d.currentState, r);
            }

            if(r2) {
                if(deltas[d.index + 1]) { // if there is a next state (not at the end)
                    d.nextState = this._parser.mergeDelta(d.nextState, r2);
                }
            }

            d.index--;
        }

        if(indexChanged) {
            this._currentState = $.extend({}, deltas[d.index], {
                game: d.currentState,
                nextGame: d.nextState,
            });

            this._emit("state-changed", this._currentState);
        }
    },

    /**
     * Returns the current state of the game
     *
     * @returns {Object} the current state, which is a custom object containing the current `game` state and the `nextGame` state.
     */
    getCurrentState: function() {
        return this._currentState;
    },

    /**
     * Initializes the Game object for the specified gameName. The class created will be the one in /games/{gameName}/game.js
     *
     * @param {string} gameName - name of the game to initialize. Must be a valid game name, or throwns an error
     */
    _initGame: function(gameName) {
        var gameNamespace = this._games[gameName];

        if(!gameNamespace) {
            throw new Error("Cannot load data for game '{}'.".format(gameClass));
        }

        this.game = new gameNamespace.Game(this._currentState.game, this._rawGamelog);

        var textures = {};

        for(var key in this.game.namespace.textures) {
            if(this.game.namespace.textures.hasOwnProperty(key)) {
                textures[key] = "games/" + this.game.namespace.dir + "/textures/" + this.game.namespace.textures[key];
            }
        }
        var self = this;
        this.renderer.loadTextures(textures, function() {
            self._ready();
        });
    },

    /**
     * Called when Viseur thinks it is ready, meaning the renderer has downloaded all assets, the gamelog is loaded, and the game class as been initalized.
     *
     * @private
     */
    _ready: function() {
        this.gui.hideModal();
        this._emit("ready", this.game, this._rawGamelog);
    },

    /**
     * Call when you want to connect to a remote gamelog source, e.g. spectator mode, arena mode, etc
     *
     * @param {Object} data - connection data, must include 'type', 'server', and 'port'.
     */
    connect: function(data) {
        var callback;

        switch(data.type.toLowerCase()) {
            case "arena":
                callback = this._connectToArena; // TODO: Do
                break;
            case "spectate":
                callback = this._spectate;
                break;
            case "human":
                callback = this._playAsHumanOn; // TODO: Do
                break;
            case "tournament":
                callback = this._connectToTournament; // TODO: Do
                break;
        }

        if(callback) {
            callback.call(this, data.server, data.port, data.gameName, data);
            return;
        }

        throw new Error("No type of connection '{}.".format(data.type));
    },

    /**
     * Connects to a Cerveau game server to spectate some game
     * @param {string} server - the server Cerveau is running on (without port)
     * @param {number} port - the port the server is running on
     * @param {string} gameName - name of the game to spectate
     */
    _spectate: function(server, port, gameName) {
        this._initJoueur(server, port, gameName, {
            spectate: true,
        });
    },

    _initJoueur: function(server, port, gameName, optionalArgs) {
        var self = this;

        this._joueur = new Joueur(server, port, gameName, optionalArgs);

        this._gamelogLoaded(self._joueur.getGamelog());

        this._joueur.on("event-delta", function() {
            self.timeManager.play(self._mergedDelta.index);

            self.emit("gamelog-updated", self._rawGamelog);
        });
    },
});

module.exports = new Viseur(); // singleton
