// This is a "class" to represent the Player object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var GameObject = require("./gameObject");
var BasePlayer = require("viseur/game/basePlayer");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs
//<<-- /Creer-Merge: requires -->>

/**
 * @typedef {Object} PlayerState - A state representing a Player
 * @property {string} clientType - What type of client this is, e.g. 'Python', 'JavaScript', or some other language. For potential data mining purposes.
 * @property {Array.<CowboyState>} cowboys - Every Cowboy owned by this Player.
 * @property {string} gameObjectName - String representing the top level Class that this game object is an instance of. Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
 * @property {string} id - A unique id for each instance of a GameObject or a sub class. Used for client and server communication. Should never change value after being set.
 * @property {number} kills - How many enemy Cowboys this player's team has killed.
 * @property {Array.<string>} logs - Any strings logged will be stored here. Intended for debugging.
 * @property {boolean} lost - If the player lost the game or not.
 * @property {string} name - The name of the player.
 * @property {PlayerState} opponent - This player's opponent in the game.
 * @property {string} reasonLost - The reason why the player lost the game.
 * @property {string} reasonWon - The reason why the player won the game.
 * @property {number} rowdiness - How rowdy their team is. When it gets too high their team takes a collective siesta.
 * @property {number} score - How many times their team has played a piano.
 * @property {number} siesta - 0 when not having a team siesta. When greater than 0 represents how many turns left for the team siesta to complete.
 * @property {number} timeRemaining - The amount of time (in ns) remaining for this AI to send commands.
 * @property {boolean} won - If the player won the game or not.
 * @property {YoungGunState} youngGun - The YoungGun this Player uses to call in new Cowboys.
 */

/**
 * @class
 * @classdesc A player in this game. Every AI controls one player.
 * @extends BasePlayer
 * @extends GameObject
 */
var Player = Classe(GameObject, BasePlayer, {
    /**
     * Initializes a Player with basic logic as provided by the Creer code generator. This is a good place to initialize sprites
     *
     * @memberof Player
     * @param {PlayerState} initialState - the initial state of this game object
     * @param {Game} game - the game this Player is in
     */
    init: function(initialState, game) {
        GameObject.init.apply(this, arguments);
        BasePlayer.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // initialization logic goes here
        //<<-- /Creer-Merge: init -->>
    },

    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "Player",

    /**
     * The current state of this Player. Undefined when there is no current state.
     *
     * @type {PlayerState|null})}
     */
    current: null,

    /**
     * The next state of this Player. Undefined when there is no next state.
     *
     * @type {PlayerState|null})}
     */
    next: null,

    /**
     * Set this to `true` if this GameObject should be rendered.
     *
     * @static
     */
    //<<-- Creer-Merge: shouldRender -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    shouldRender: false,
    //<<-- /Creer-Merge: shouldRender -->>

    /**
     * Called approx 60 times a second to update and render the Player. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {PlayerState} current - the current (most) game state, will be this.next if this.current is null
     * @param {PlayerState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    render: function(dt, current, next, reason, nextReason) {
        GameObject.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // render where the Player is
        //<<-- /Creer-Merge: render -->>
    },

    /**
     * Invoked after init or when a player changes their color, so we have a chance to recolor this GameObject's sprites
     */
    recolor: function() {
        GameObject.recolor.apply(this, arguments);

        //<<-- Creer-Merge: recolor -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // replace with code to recolor sprites based on player color
        //<<-- /Creer-Merge: recolor -->>
    },

    /**
     * Invoked when the right click menu needs to be shown.
     *
     * @private
     * @returns {Array} array of context menu items, which can be {text, icon, callback} for items, or "---" for a seperator
     */
    _getContextMenu: function() {
        var self = this;
        var menu = [];

        //<<-- Creer-Merge: _getContextMenu -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // add context items to the menu here
        //<<-- /Creer-Merge: _getContextMenu -->>

        return menu;
    },


    // Joueur functions - functions invoked for human playable client

    // /Joueur functions

    /**
     * Invoked when the state updates.
     *
     * @private
     * @param {PlayerState} current - the current (most) game state, will be this.next if this.current is null
     * @param {PlayerState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next, reason, nextReason) {
        GameObject._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update the Player based on its current and next states
        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add to this class can be perserved here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = Player;
