var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var Observable = require("core/observable");
var SettingsManager = require("viseur/settingsManager");
var GameOverScreen = require("./gameOverScreen");
var Viseur = null;

/**
 * @class BaseGame - the base class all games in the games/ folder inherit from
 */
var BaseGame = Classe(Observable, {
    /**
     * Initializes the BaseGame, should be invoked by a Game superclass
     *
     * @constructor
     * @param {Object} gamelog - the gamelog for this game, may be a streaming gamelog
     * @param {string} [playerID] - the player id of the human player, if there is one
     */
    init: function(gamelog, playerID) {
        Observable.init.call(this);
        Viseur = require("viseur/"); // require here to avoid cycles

        this.renderer = Viseur.renderer;
        this.gameObjects = {};
        this.random = new Math.seedrandom(gamelog ? gamelog.randomSeed : undefined);
        this.players = [];

        var self = this;
        Viseur.on("ready", function() {
            self._start(gamelog.deltas[0].game);
        });

        Viseur.on("state-changed", function(state) {
            self._updateState(state);
        });

        this._initLayers(this._layerNames);

        this._playerID = playerID;
        this.humanPlayer = new this.namespace.HumanPlayer(this);

        this.gameOverScreen = new GameOverScreen({
            $parent: Viseur.gui.$rendererWrapper,
            game: this,
        });

        // allow sub classes to override player colors
        this._defaultPlayerColors = [ Color("#C33"), Color("#33C") ]; // the default colors, red and blue
        this._setDefaultPlayersColors(this._defaultPlayerColors);

        // inject player color settings
        var settings = this.namespace.settings;
        for(var i = this.numberOfPlayers; i--;) { // iterate in reverse order
            settings.unshift({
                id: "player-color-" + i,
                label: "Player " + i + " Color",
                hint: "Overrides the color for Player " + i,
                input: "ColorPicker",
                default: this._defaultPlayerColors[i].hexString(),
            });
        }

        settings.unshift({
            id: "custom-player-colors",
            label: "Custom Player Colors",
            hint: "Use your custom player colors defined below.",
            input: "CheckBox",
            default: true,
        });
    },

    /**
     * starts the game, basically like init, but after other stuff is ready (like loading textures).
     *
     * @private
     */
    _start: function() {
        this._started = true;
        var self = this;

        var state = Viseur.getCurrentState();

        this._initBackground(state.game || state.nextGame);

        this._updateState(state);

        this.pane = new this.namespace.Pane(this, this.next);
        this.pane.update(this.current || this.next);

        if(this.humanPlayer) {
            this.humanPlayer.setPlayer(this.gameObjects[this._playerID]);
            this.pane.setHumanPlayer(this._playerID);
        }

        // attach callbacks to recolor whenever a color setting changes
        var recolorCallback = function recolorCallback() {
            self.recolor();
        };

        this.onSettingChanged("custom-player-colors", recolorCallback);
        for(var i = this.numberOfPlayers; i--;) { // iterate in reverse order
            self.onSettingChanged("player-color-" + i, recolorCallback);
        }
    },

    /**
     * Called once to initialize any PIXI objects needed to render the background
     *
     * @private
     */
    _initBackground: function() {},

    /**
     * renders the static background
     *
     * @private
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {Object} current - the current (most) game state, will be this.next if this.current is null
     * @param {Object} next - the next (most) game state, will be this.current if this.next is null
     */
    _renderBackground: function(dt, current, next) {},

    /**
     * default layers for all games to put containers in, these can be extended
     *
     * @type {Array}
     */
    _layerNames: [
        "background",
        "game",
        "ui",
    ],

    /**
     * Intended to be overwritten by sub classes
     *
     * @type {Number}
     */
    numberOfPlayers: 2,

    /**
     * Initializes layers based on _layerNames
     *
     * @private
     * @param {Array.<string>} layerNames - list of layer names to initialize a layer for
     */
    _initLayers: function(layerNames) {
        this.layers = {};
        for(var i = 0; i < layerNames.length; i++) {
            var container = new PIXI.Container();
            container.setParent(this.renderer.rootContainer);
            this.layers[layerNames[i]] = container;
        }
    },

    /**
     * Called at approx 60/sec to render the game, and all the game objects within it
     *
     * @param {number} index the index of the state to render
     * @param {number} dt - the tweening between the index state and the next to render
     */
    render: function(index, dt) {
        if(!this._started) {
            return;
        }

        var current = this.current || this.next;
        var next = this.next || this.current;

        this._renderBackground(index, dt);

        for(var id in this.gameObjects) {
            if(this.gameObjects.hasOwnProperty(id)) {
                var gameObject = this.gameObjects[id];
                // game objects "exist" to be rendered if the have a next or current state, they will not exist if players go back in time to before the game object was created
                var exists = (current && current.gameObjects.hasOwnProperty(id) ) || (next && next.gameObjects.hasOwnProperty(id));

                if(gameObject.container) {
                    gameObject.container.visible = exists; // if it does not exist, no not render them, otherwise do, and later we'll call their render()
                }

                if(exists && gameObject.shouldRender) { // game objects by default do not render, as many are invisible
                    gameObject.render(
                        dt,
                        gameObject.current || gameObject.next,
                        gameObject.next || gameObject.current,
                        this._currentReason,
                        this._nextReason
                    );
                }
            }
        }
    },

    /**
     * Invoked when the game state updates, checking if game objects should be created that we have no seen before
     *
     * @private
     * @param {Object} state - the current state
     * @returns {Object} the current(most) state
     */
    _updateState: function(state) {
        if(!this._started) {
            return;
        }

        this.gameOverScreen.hide();

        this.current = state.game;
        this.next = state.nextGame;

        var stateGameObjects;
        if(state.game) {
            stateGameObjects = state.game.gameObjects;
        }

        if(state.nextGame) {
            stateGameObjects = state.nextGame.gameObjects;
        }

        // initialize new game objects we have not seen yet
        var newGameObjects = {};
        for(var id in stateGameObjects) {
            if(stateGameObjects.hasOwnProperty(id) && !this.gameObjects[id]) {
                var newGameObject = this._initGameObject(id, (state.game && state.game.gameObjects[id]) || (state.nextGame && state.nextGame.gameObjects[id]));
                newGameObjects[newGameObject.id] = true; // poor man's set
            }
        }

        // save the reasons for the current and next deltas
        this._currentReason = this._hookupGameObjectReferences(state.reason);
        this._nextReason = this._hookupGameObjectReferences(state.nextReason);

        // update all the game objects now (including those we may have just created)
        for(id in stateGameObjects) {
            if(stateGameObjects.hasOwnProperty(id)) {
                this.gameObjects[id].current = state.game ? state.game.gameObjects[id] : null;
                this.gameObjects[id].next = state.nextGame ? state.nextGame.gameObjects[id] : null;
            }
        }

        // now that all the game objects are updated, tell them they got updated
        for(id in stateGameObjects) {
            if(stateGameObjects.hasOwnProperty(id)) {
                var gameObject = this.gameObjects[id];

                gameObject.updated(gameObject.current, gameObject.next, this._currentReason, this._nextReason);
                if(newGameObjects[id]) {
                    // it needs to be colored, now that all of it's references are hooked up
                    gameObject.recolor();
                }
            }
        }

        if(this.pane) {
            this.pane.update(this.current || this.next);
        }

        this._stateUpdated(this.current || this.next, this.next || this.current, this._currentReason, this._nextReason);

        return state;
    },

    /**
     * The reason why a delta occured, including data about that event
     * @typedef {Object} DeltaReason
     * @property {string} type - reason name, e.g. `start`, `ran`, `finished`, or `disconnect`
     * @property {Object} [data] - data about the event
     * @property {Player} [data.player] - present when the player requests something be `ran` or they `disconnect`
     * @property {Object} [data.run] - present when `ran`.
     * @property {Object} [data.run.args] - arguments sent from the client to the run function.
     * @property {GameObject} [data.run.caller] - The game object invoking this run
     * @property {string} [data.run.functionName] - the string name of the member function of the caller to run server-side
     * @property {*} [returned] - present when `ran`, and will be the return value from that `ran`
     * @property {boolean} [timeout] - true when `disconnect` if the disconnect was forced due to timeout, false otherwise (the client disconnected gracefully, probably due to exception being thrown on their end)
     */

    /**
     * find game object references, and hooks them up in an object
     *
     * @param {Object} obj - object to search through and clone, hooking up game object references
     * @returns {Object} a new object, with no game object references
     */
    _hookupGameObjectReferences: function(obj) {
        if(typeof(obj) !== "object" || obj === null) {
            return obj;
        }

        if(Object.hasOwnProperty.call(obj, "id")) { // it's a game object reference
            return this.gameObjects[obj.id];
        }

        var cloned = {};
        for(var key in obj) {
            if(obj.hasOwnProperty(key)) {
                cloned[key] = this._hookupGameObjectReferences(obj[key]);
            }
        }

        return cloned;
    },

    /**
     * Invoked when the state updates. Intended to be overridden by subclass(es)
     *
     * @private
     * @param {GameState} current - the current (most) game state, will be this.next if this.current is null
     * @param {GameState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next) {},

    /**
     * initializes a new game object with the given id
     *
     * @param {string} id - the id of the game object to initialize
     * @param {Object} state - the initial state of the new game object
     * @returns {BaseGameObject} the newly created game object
     */
    _initGameObject: function(id, state) {
        var className = state.gameObjectName;
        var newGameObject = new this._gameObjectClasses[className](state, this);

        var self = this;
        newGameObject.on("inspect", function() {
            self._emit("inspect", id);
        });

        this.gameObjects[id] = newGameObject;

        if(className === "Player") {
            this.players[newGameObject.playersIndex] = newGameObject;
            newGameObject.defaultColor = this._defaultPlayerColors[newGameObject.playersIndex];
        }

        return newGameObject;
    },

    /**
     * highlights some game object given the id
     * @param {string} gameObjectID the id of the game object to highlight
     */
    highlight: function(gameObjectID) {
        var gameObject = this.gameObjects[gameObjectID];

        for(var id in this.gameObjects) {
            if(this.gameObjects.hasOwnProperty(id)) {
                var otherGameObject = this.gameObjects[id];

                if(otherGameObject !== gameObject) {
                    otherGameObject.unhighlight();
                }
            }
        }

        gameObject.highlight();

        this._emit("highlighted", gameObject.id);
    },

    /**
     * Gets the current value of a setting for this game
     *
     * @param {string} key - the key of the setting to get
     * @returns {*} the current value of the setting
     */
    getSetting: function(key) {
        return SettingsManager.get(this.name, key);
    },

    /**
     * attaches a callback to a setting for this game
     *
     * @param {string} key - the key to attach callback to
     * @param {Function} callback - the callback function
     */
    onSettingChanged: function(key, callback) {
        SettingsManager.onChanged(this.name, key, callback);
    },

    /**
     * Sets the default colors of the player, should be indexed by their place in the Game.players array
     *
     * @param {Array.<Color>} colors - the colors for those players, defaults to red and blue
     */
    _setDefaultPlayersColors: function(colors) {
        // this is a virtual interface method
    },

    /**
     * Invoked when a player color changes, so all game objects have an opportunity to recolor themselves
     */
    recolor: function() {
        for(var id in this.gameObjects) {
            if(this.gameObjects.hasOwnProperty(id)) {
                this.gameObjects[id].recolor();
            }
        }

        this.pane.recolor();
        this.gameOverScreen.recolor();
    },

    /**
     * Runs some command on the server, on behalf of this a game object
     *
     * @param {BaseGameObject} baseGameObject - the game object running this
     * @param {string} run - the function to run
     * @param {Object} args - key value pairs for the function to run
     * @param {Function} callback - callback to invoke once run, is passed the return value
     */
    runOnServer: function(baseGameObject, run, args, callback) {
        Viseur.runOnServer(baseGameObject.id, run, args, callback);
    },

    /**
     * Order the human playing to do some
     * @param {string} orderName - the order (functionName) to execute
     * @param {Array} args - arguments to apply to the order function
     * @param {Function} callback - the function the humanPlayer should callback once done with the order
     */
    orderHuman: function(orderName, args, callback) {
        this.humanPlayer.order(orderName, args, callback);
    },
});

module.exports = BaseGame;
