var Classe = require("classe");
var PIXI = require("pixi.js");
var Viseur = null;

var BaseGame = Classe({
    init: function(gamelog) {
        Viseur = require("viseur/"); // require here to avoid cycles
        this.renderer = Viseur.renderer;
        this.gameObjects = {};
        this.random = new Math.seedrandom(gamelog.randomSeed);

        var self = this;
        Viseur.on("ready", function(game, gamelog) {
            self.start();
        });

        Viseur.on("state-changed", function(state) {
            self._updateState(state);
        });

        this._initLayers();
    },

    _gamelogLoaded: function() {},

    _checkToStart: function() {
        if(this._isGamelogLoaded && this._areTexturesLoaded) {
            this.start();
        }
    },

    start: function() {
        this._started = true;
        this.renderBackground();

        this._updateState(Viseur.getCurrentState());
    },

    renderBackground: function() {},

    _layerNames: [
        "background",
        "game",
        "ui"
    ],

    _initLayers: function() {
        this.layers = {};
        for(var i = 0; i < this._layerNames.length; i++) {
            var container = new PIXI.Container();
            container.setParent(this.renderer.rootContainer);
            this.layers[this._layerNames[i]] = container;
        }
    },

    render: function(index, dt) {
        for(var id in this.gameObjects) {
            if(this.gameObjects.hasOwnProperty(id)) {
                var gameObject = this.gameObjects[id];
                if(gameObject.render) {
                    gameObject.render(dt);
                }
            }
        }
    },

    _updateState: function(state) {
        if(!this._started) {
            return;
        }

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
                    this.gameObjects[id] = new this._gameObjectClasses[nextGameObject.gameObjectName](nextGameObject, this);
                }

                this.gameObjects[id].update(currentGameObject, nextGameObject);
            }
        }
    },
});

module.exports = BaseGame;
