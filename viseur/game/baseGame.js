var Classe = require("classe");
var PIXI = require("pixi.js");
var Observable = require("core/observable");
var SettingsManager = require("viseur/settingsManager");
var Viseur = null;

/**
 * @class BaseGame - the base class all games in the games/ folder inherit from
 */
var BaseGame = Classe(Observable, {
    init: function(gamelog) {
        Observable.init.call(this);
        Viseur = require("viseur/"); // require here to avoid cycles

        this.renderer = Viseur.renderer;
        this.gameObjects = {};
        this.random = new Math.seedrandom(gamelog ? gamelog.randomSeed : undefined);

        var self = this;
        Viseur.on("ready", function() {
            self._start();
        });

        Viseur.on("state-changed", function(state) {
            self._updateState(state);
        });

        this._initLayers();
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

        this.pane = new this.namespace.Pane(this, this.current);
        this.pane.update(state);
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
     */
    _renderBackground: function() {},

    _layerNames: [
        "background",
        "game",
        "ui"
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
     */
    render: function(index, dt) {
        if(!this._started) {
            return;
        }

        this._renderBackground(index, dt);

        for(var id in this.gameObjects) {
            if(this.gameObjects.hasOwnProperty(id)) {
                var gameObject = this.gameObjects[id];
                if(gameObject.shouldRender) { // game objects by default do not render, as many are invisible
                    gameObject.render(dt);
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

        this.current = state.game;
        this.next = state.nextGame;

        var stateGameObjects = state.game.gameObjects;
        if(state.nextGame) {
            stateGameObjects = state.game.gameObjects;
        }

        for(var id in stateGameObjects) {
            if(stateGameObjects.hasOwnProperty(id)) {
                var currentGameObject = state.game.gameObjects[id];
                var nextGameObject = undefined;
                if(state.nextGame) {
                    nextGameObject = state.nextGame.gameObjects[id];
                }

                if(!this.gameObjects[id]) { // this is the first time we've seen this game object, so create its instance
                    this._initGameObject(id, nextGameObject || currentGameObject);
                }

                this.gameObjects[id].update(currentGameObject, nextGameObject);
            }
        }

        if(this.pane) {
            this.pane.update(state);
        }

        return state;
    },

    /**
     * initializes a new game object with the given id
     * @param {string} id - the id of the game object to initialize
     * @param {Object} state - the initial state of the new game object
     */
    _initGameObject: function(id, state) {
        var newGameObject = new this._gameObjectClasses[state.gameObjectName](state, this);

        var self = this;
        newGameObject.on("clicked", function() {
            self._emit("clicked", id);
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
});

module.exports = BaseGame;
