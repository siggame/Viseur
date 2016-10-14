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

        var self = this;
        Viseur.on("ready", function() {
            self._start(gamelog.deltas[0].game);
        });

        Viseur.on("state-changed", function(state) {
            self._updateState(state);
        });

        this._initLayers();

        this._playerID = playerID;
        this.humanPlayer = new this.namespace.HumanPlayer(this);

        this.gameOverScreen = new GameOverScreen({
            $parent: Viseur.gui.$rendererWrapper,
            game: this,
        });
    },

    /**
     * starts the game, basically like init, but after other stuff is ready (like loading textures).
     *
     * @private
     */
    _start: function() {
        this._started = true;

        this._initBackground();

        var state = this._updateState(Viseur.getCurrentState());

        this.pane = new this.namespace.Pane(this, this.next);
        this.pane.update(this.current || this.next);

        if(this.humanPlayer) {
            this.humanPlayer.setPlayer(this.gameObjects[this._playerID]);
        }
    },

    /**
     * Called once to initalize any PIXI objects needed to render the background
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
     * Initializes layers based on _layerNames
     *
     * @private
     */
    _initLayers: function() {
        this.layers = {};
        for(var i = 0; i < this._layerNames.length; i++) {
            var container = new PIXI.Container();
            container.setParent(this.renderer.rootContainer);
            this.layers[this._layerNames[i]] = container;
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
                    gameObject.render(dt, gameObject.current || gameObject.next, gameObject.next || gameObject.current);
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

        for(var id in stateGameObjects) {
            if(stateGameObjects.hasOwnProperty(id)) {
                var currentGameObject = state.game ? state.game.gameObjects[id] : null;
                var nextGameObject = state.nextGame ? state.nextGame.gameObjects[id] : null;

                if(!this.gameObjects[id]) { // this is the first time we've seen this game object, so create its instance
                    this._initGameObject(id, currentGameObject || nextGameObject);
                }

                this.gameObjects[id].update(currentGameObject, nextGameObject);
            }
        }

        if(this.pane) {
            this.pane.update(this.current || this.next);
        }

        this._stateUpdated(this.current || this.next, this.next || this.current);

        return state;
    },

    /**
     * Invoked when the state updates. Intended to be overriden by subclass(es)
     *
     * @private
     * @param {Object} current - the current (most) game state, will be this.next if this.current is null
     * @param {Object} next - the next (most) game state, will be this.current if this.next is null
     */
    _stateUpdated: function(current, next) {},

    /**
     * initializes a new game object with the given id
     * @param {string} id - the id of the game object to initialize
     * @param {Object} state - the initial state of the new game object
     */
    _initGameObject: function(id, state) {
        var newGameObject = new this._gameObjectClasses[state.gameObjectName](state, this);

        var self = this;
        newGameObject.on("inspect", function() {
            self._emit("inspect", id);
        });

        this.gameObjects[id] = newGameObject;
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
     * Gets the colors of the player, should be indexed by their place in the Game.players array
     *
     * @returns {Array.<Color>} - the colors for those players, defaults to red and blue
     */
    getPlayersColors: function() {
        return [ Color("#C33"), Color("#33C") ]; // by default player 1 is red, player 2 is blue
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
