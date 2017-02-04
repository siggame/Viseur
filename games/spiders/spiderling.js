// This is a "class" to represent the Spiderling object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var Spider = require("./spider");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs
//<<-- /Creer-Merge: requires -->>

/**
 * @typedef {Object} SpiderlingState - A state representing a Spiderling
 * @property {string} busy - When empty string this Spiderling is not busy, and can act. Otherwise a string representing what it is busy with, e.g. 'Moving', 'Attacking'.
 * @property {string} gameObjectName - String representing the top level Class that this game object is an instance of. Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
 * @property {string} id - A unique id for each instance of a GameObject or a sub class. Used for client and server communication. Should never change value after being set.
 * @property {boolean} isDead - If this Spider is dead and has been removed from the game.
 * @property {Array.<string>} logs - Any strings logged will be stored here. Intended for debugging.
 * @property {WebState} movingOnWeb - The Web this Spiderling is using to move. Null if it is not moving.
 * @property {NestState} movingToNest - The Nest this Spiderling is moving to. Null if it is not moving.
 * @property {NestState} nest - The Nest that this Spider is currently on. Null when moving on a Web.
 * @property {number} numberOfCoworkers - The number of Spiderlings busy with the same work this Spiderling is doing, speeding up the task.
 * @property {PlayerState} owner - The Player that owns this Spider, and can command it.
 * @property {number} workRemaining - How much work needs to be done for this Spiderling to finish being busy. See docs for the Work forumla.
 */

/**
 * @class
 * @classdesc A Spider spawned by the BroodMother.
 * @extends Spider
 */
var Spiderling = Classe(Spider, {
    /**
     * Initializes a Spiderling with basic logic as provided by the Creer code generator. This is a good place to initialize sprites
     *
     * @memberof Spiderling
     * @param {SpiderlingState} initialState - the initial state of this game object
     * @param {Game} game - the game this Spiderling is in
     */
    init: function(initialState, game) {
        Spider.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // initialization logic goes here
        //<<-- /Creer-Merge: init -->>
    },

    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "Spiderling",

    /**
     * The current state of this Spiderling. Undefined when there is no current state.
     *
     * @type {SpiderlingState|null})}
     */
    current: null,

    /**
     * The next state of this Spiderling. Undefined when there is no next state.
     *
     * @type {SpiderlingState|null})}
     */
    next: null,

    // The following values should get overridden when delta states are merged, but we set them here as a reference for you to see what variables this class has.

    /**
     * Set this to `true` if this GameObject should be rendered.
     *
     * @static
     */
    //<<-- Creer-Merge: shouldRender -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    shouldRender: false,
    //<<-- /Creer-Merge: shouldRender -->>

    /**
     * Called approx 60 times a second to update and render the Spiderling. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {SpiderlingState} current - the current (most) game state, will be this.next if this.current is null
     * @param {SpiderlingState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    render: function(dt, current, next, reason, nextReason) {
        Spider.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // render where the Spiderling is
        //<<-- /Creer-Merge: render -->>
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

    /**
     * Attacks another Spiderling
     *
     * @param {SpiderlingState} spiderling - The Spiderling to attack.
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    attack: function(spiderling, callback) {
        this._runOnServer("attack", {
            spiderling: spiderling,
        }, callback);
    },

    /**
     * Starts moving the Spiderling across a Web to another Nest.
     *
     * @param {WebState} web - The Web you want to move across to the other Nest.
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    move: function(web, callback) {
        this._runOnServer("move", {
            web: web,
        }, callback);
    },

    // /Joueur functions

    /**
     * Invoked when the state updates.
     *
     * @private
     * @param {SpiderlingState} current - the current (most) game state, will be this.next if this.current is null
     * @param {SpiderlingState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next, reason, nextReason) {
        Spider._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update the Spiderling based on its current and next states
        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add to this class can be perserved here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = Spiderling;
