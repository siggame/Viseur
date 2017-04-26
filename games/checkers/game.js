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
 * @property {number} boardHeight - The height of the board for the Y component of a checker.
 * @property {number} boardWidth - The width of the board for X component of a checker.
 * @property {CheckerState} checkerMoved - The checker that last moved and must be moved because only one checker can move during each players turn.
 * @property {boolean} checkerMovedJumped - If the last checker that moved jumped, meaning it can move again.
 * @property {Array.<CheckerState>} checkers - All the checkers currently in the game.
 * @property {PlayerState} currentPlayer - The player whose turn it is currently. That player can send commands. Other players cannot.
 * @property {number} currentTurn - The current turn number, starting at 0 for the first player's turn.
 * @property {Object.<string, GameObjectState>} gameObjects - A mapping of every game object's ID to the actual game object. Primarily used by the server and client to easily refer to the game objects via ID.
 * @property {number} maxTurns - The maximum number of turns before the game will automatically end.
 * @property {Array.<PlayerState>} players - List of all the players in the game.
 * @property {string} session - A unique identifier for the game instance that is being played.
 */

/**
 * @class
 * @classdesc The simple version of American Checkers. An 8x8 board with 12 checkers on each side that must move diagonally to the opposing side until kinged.
 * @extends BaseGame
 */
var Game = Classe(BaseGame, {
    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "Checkers",

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

    /**
     * How many players are expected to be in an instance of this Game
     *
     * @type {number}
     */
    numberOfPlayers: 2,

    /**
     * Called when Viseur is ready and wants to start rendering the game. This is really where you should init stuff
     *
     * @private
     * @param {GameState} state - the starting state of this game
     */
    _start: function(state) {
        BaseGame._start.call(this);

        //<<-- Creer-Merge: _start -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // create some sprites
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
        // initialize a background bro
        //<<-- /Creer-Merge: _initBackground -->>
    },

    /**
     * Called approx 60 times a second to update and render the background. Leave empty if the background is static
     *
     * @private
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {GameState} current - the current (most) game state, will be this.next if this.current is null
     * @param {GameState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _renderBackground: function(dt, current, next, reason, nextReason) {
        BaseGame._renderBackground.call(this);

        //<<-- Creer-Merge: _renderBackground -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update and re-render whatever you initialize in _initBackground
        //<<-- /Creer-Merge: _renderBackground -->>
    },

    /**
     * Sets the default colors of the player, should be indexed by their place in the Game.players array
     *
     * @param {Array.<Color>} colors - the colors for those players, defaults to red and blue
     */
    _setDefaultPlayersColors: function(colors) {
        //<<-- Creer-Merge: _setDefaultPlayersColors -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // You can change the players' colors here, by default player 0 is red, player 1 is blue.
        //<<-- /Creer-Merge: _setDefaultPlayersColors -->>
    },


    /**
     * Invoked when the state updates.
     *
     * @private
     * @param {GameState} current - the current (most) game state, will be this.next if this.current is null
     * @param {GameState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next, reason, nextReason) {
        BaseGame._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update the Game based on its current and next states
        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add to this class can be perserved here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = Game;
