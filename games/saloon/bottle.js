// This is a "class" to represent the Bottle object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs
//<<-- /Creer-Merge: requires -->>

/**
 * @typedef {Object} BottleID - a "shallow" state of a Bottle, which is just an object with an `id`.
 * @property {string} id - the if of the BottleState it represents in game.gameObjects
 */

/**
 * @typedef {Object} BottleState - A state representing a Bottle
 * @property {TileID} direction - The Direction this Bottle is flying and will move to between turns, can be 'North', 'East', 'South', or 'West'.
 * @property {string} drunkDirection - The direction any Cowboys hit by this will move, can be 'North', 'East', 'South', or 'West'.
 * @property {string} gameObjectName - String representing the top level Class that this game object is an instance of. Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
 * @property {string} id - A unique id for each instance of a GameObject or a sub class. Used for client and server communication. Should never change value after being set.
 * @property {boolean} isDestroyed - True if this Bottle has impacted and has been destroyed (removed from the Game). False if still in the game flying through the saloon.
 * @property {Array.<string>} logs - Any strings logged will be stored here. Intended for debugging.
 * @property {TileID} tile - The Tile this bottle is currently flying over.
 */

/**
 * @class
 * @classdesc A bottle thrown by a bartender at a Tile.
 * @extends GameObject
 */
var Bottle = Classe(GameObject, {
    /**
     * Initializes a Bottle with basic logic as provided by the Creer code generator. This is a good place to initialize sprites
     *
     * @memberof Bottle
     * @private
     */
    init: function(initialState, game) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // initialization logic goes here
        //<<-- /Creer-Merge: init -->>
    },

    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "Bottle",

    /**
     * The current state of this Bottle. Undefined when there is no current state.
     *
     * @type {BottleState | undefined})}
     */
    current: {},

    /**
     * The next state of this Bottle. Undefined when there is no next state.
     *
     * @type {BottleState | undefined})}
     */
    next: {},

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
     * Called approx 60 times a second to update and render the Bottle. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     */
    render: function(dt) {
        GameObject.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // render where the Bottle is
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

    // /Joueur functions

    /**
     * Invoked when the state updates.
     *
     * @private
     */
    _stateUpdated: function() {
        GameObject._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update the Bottle based on its current and next states
        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add to this class can be perserved here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = Bottle;
