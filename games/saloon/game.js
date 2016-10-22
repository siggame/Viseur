// This is a "class" to represent the Game object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var BaseGame = require("viseur/game/baseGame");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs
//<<-- /Creer-Merge: requires -->>

/**
 * @typedef {Object} GameState - A state representing a Game
 * @property {Array.<BottleState>} bottles - All the beer Bottles currently flying across the saloon in the game.
 * @property {Array.<CowboyState>} cowboys - Every Cowboy in the game.
 * @property {PlayerState} currentPlayer - The player whose turn it is currently. That player can send commands. Other players cannot.
 * @property {number} currentTurn - The current turn number, starting at 0 for the first player's turn.
 * @property {Array.<FurnishingState>} furnishings - Every furnishing in the game.
 * @property {Object.<string, GameObjectState>} gameObjects - A mapping of every game object's ID to the actual game object. Primarily used by the server and client to easily refer to the game objects via ID.
 * @property {Array.<string>} jobs - All the jobs that Cowboys can be called in with.
 * @property {number} mapHeight - The number of Tiles in the map along the y (vertical) axis.
 * @property {number} mapWidth - The number of Tiles in the map along the x (horizontal) axis.
 * @property {number} maxCowboysPerJob - The maximum number of Cowboys a Player can bring into the saloon of each specific job.
 * @property {number} maxTurns - The maximum number of turns before the game will automatically end.
 * @property {Array.<PlayerState>} players - List of all the players in the game.
 * @property {number} rowdynessToSiesta - When a player's rowdyness reaches or exceeds this number their Cowboys take a collective siesta.
 * @property {string} session - A unique identifier for the game instance that is being played.
 * @property {number} siestaLength - How long siestas are for a player's team.
 * @property {Array.<TileState>} tiles - All the tiles in the map, stored in Row-major order. Use `x + y * mapWidth` to access the correct index.
 */

/**
 * @class
 * @classdesc Use cowboys to have a good time and play some music on a Piano, while brawling with enemy Coyboys.
 * @extends BaseGame
 */
var Game = Classe(BaseGame, {
    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "Saloon",

    /**
     * The current state of this Game. Undefined when there is no current state.
     *
     * @type {GameState|null})}
     */
    current: null,

    /**
     * The next state of this Game. Undefined when there is no next state.
     *
     * @type {GameState|null})}
     */
    next: null,

    // The following values should get overridden when delta states are merged, but we set them here as a reference for you to see what variables this class has.

    /**
     * Called when Viseur is ready and wants to start rendering the game. This is really where you should init stuff
     *
     * @private
     * @param {GameState} state - the starting state of this game
     */
    _start: function(state) {
        BaseGame._start.call(this);

        //<<-- Creer-Merge: _start -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.renderer.setSize(state.mapWidth, state.mapHeight);

        //<<-- /Creer-Merge: _start -->>
    },

    /**
     * initializes the background. It is drawn once automatically after this step.
     *
     * @private
     * @param {GameState} state - initial state to use the render the background
     */
    _initBackground: function(state) {
        BaseGame._initBackground.call(this);

        //<<-- Creer-Merge: _initBackground -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        //<<-- /Creer-Merge: _initBackground -->>
    },

    /**
     * Called approx 60 times a second to update and render the background. Leave empty if the background is static
     *
     * @private
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {GameState} current - the current (most) game state, will be this.next if this.current is null
     * @param {GameState} next - the next (most) game state, will be this.current if this.next is null
     */
    _renderBackground: function(dt, current, next) {
        BaseGame._renderBackground.call(this);

        //<<-- Creer-Merge: _renderBackground -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update and re-render whatever you initialize in _initBackground
        //<<-- /Creer-Merge: _renderBackground -->>
    },

    /**
     * Gets the colors of the player, should be indexed by their place in the Game.players array
     *
     * @returns {Array.<Color>} - the colors for those players, defaults to red and blue
     */
    getPlayersColors: function() {
        var colors = BaseGame.getPlayersColors.apply(this, arguments);

        //<<-- Creer-Merge: getPlayersColors -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // You can change the players' colors here, by default player 1 is red, player 2 is blue.
        //<<-- /Creer-Merge: getPlayersColors -->>

        return colors;
    },

    /**
     * Invoked when the state updates.
     *
     * @private
     * @param {GameState} current - the current (most) game state, will be this.next if this.current is null
     * @param {GameState} next - the next (most) game state, will be this.current if this.next is null
     */
    _stateUpdated: function(current, next) {
        BaseGame._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update the Game based on its current and next states
        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    /**
     * Add a layer to draw balcony railings on
     *
     * @override
     */
    _initLayers: function() {
        this._layerNames.push("balcony");
        BaseGame._initLayers.apply(this, arguments);
    },
    //<<-- /Creer-Merge: functions -->>

});

module.exports = Game;
