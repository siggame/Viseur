// This is a "class" to represent the Checker object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs
//<<-- /Creer-Merge: requires -->>

/**
 * @typedef {Object} CheckerState - A state representing a Checker
 * @property {string} gameObjectName - String representing the top level Class that this game object is an instance of. Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
 * @property {string} id - A unique id for each instance of a GameObject or a sub class. Used for client and server communication. Should never change value after being set.
 * @property {boolean} kinged - If the checker has been kinged and can move backwards.
 * @property {Array.<string>} logs - Any strings logged will be stored here. Intended for debugging.
 * @property {PlayerState} owner - The player that controls this Checker.
 * @property {number} x - The x coordinate of the checker.
 * @property {number} y - The y coordinate of the checker.
 */

/**
 * @class
 * @classdesc A checker on the game board.
 * @extends GameObject
 */
var Checker = Classe(GameObject, {
    /**
     * Initializes a Checker with basic logic as provided by the Creer code generator. This is a good place to initialize sprites
     *
     * @memberof Checker
     * @param {CheckerState} initialState - the initial state of this game object
     * @param {Game} game - the game this Checker is in
     */
    init: function(initialState, game) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        this.owner = this.game.gameObjects[initialState.owner.id];
        this._initContainer(this.game.boardContainer);

        this.checkerSprite = this.renderer.newSprite("checker", this.container);
        this.kingSprite = this.renderer.newSprite("king", this.container);

        this.kingSprite.visible = false;
        //<<-- /Creer-Merge: init -->>
    },

    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "Checker",

    /**
     * The current state of this Checker. Undefined when there is no current state.
     *
     * @type {CheckerState|null})}
     */
    current: null,

    /**
     * The next state of this Checker. Undefined when there is no next state.
     *
     * @type {CheckerState|null})}
     */
    next: null,

    /**
     * Set this to `true` if this GameObject should be rendered.
     *
     * @static
     */
    //<<-- Creer-Merge: shouldRender -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    shouldRender: true,
    //<<-- /Creer-Merge: shouldRender -->>

    /**
     * Called approx 60 times a second to update and render the Checker. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {CheckerState} current - the current (most) game state, will be this.next if this.current is null
     * @param {CheckerState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    render: function(dt, current, next, reason, nextReason) {
        GameObject.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // render where the Checker is

        if(current.jumped) {
            this.container.visible = false;
            return;
        }

        this.container.visible = true;

        this.container.x = ease(current.x, next.x, dt, "cubicInOut");
        this.container.y = ease(current.y, next.y, dt, "cubicInOut");

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

    /**
     * Returns if the checker is owned by your player or not.
     *
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    isMine: function(callback) {
        this._runOnServer("isMine", {
        }, callback);
    },

    /**
     * Moves the checker from its current location to the given (x, y).
     *
     * @param {number} x - The x coordinate to move to.
     * @param {number} y - The y coordinate to move to.
     * @param {Function} [callback] - callback that is passed back the return value of CheckerState once ran on the server
     */
    move: function(x, y, callback) {
        this._runOnServer("move", {
            x: x,
            y: y,
        }, callback);
    },

    // /Joueur functions

    /**
     * Invoked when the state updates.
     *
     * @private
     * @param {CheckerState} current - the current (most) game state, will be this.next if this.current is null
     * @param {CheckerState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next, reason, nextReason) {
        GameObject._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update the Checker based on its current and next states
        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add to this class can be perserved here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = Checker;
