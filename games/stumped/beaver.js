// This is a "class" to represent the Beaver object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs
//<<-- /Creer-Merge: requires -->>

/**
 * @typedef {Object} BeaverState - A state representing a Beaver
 * @property {number} actions - The number of actions remaining for this beaver this turn.
 * @property {number} branches - The number of branches this beaver is holding.
 * @property {number} distracted - Number of turns this beaver is distracted for (0 means not distracted).
 * @property {number} fish - The number of fish this beaver is holding.
 * @property {string} gameObjectName - String representing the top level Class that this game object is an instance of. Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
 * @property {number} health - How much health this beaver has left.
 * @property {string} id - A unique id for each instance of a GameObject or a sub class. Used for client and server communication. Should never change value after being set.
 * @property {JobState} job - The job this beaver was recruited to do.
 * @property {Array.<string>} logs - Any strings logged will be stored here. Intended for debugging.
 * @property {number} moves - How many moves this beaver has left this turn.
 * @property {PlayerState} owner - The Player that owns and can control this beaver.
 * @property {TileState} tile - The tile this beaver is on.
 */

/**
 * @class
 * @classdesc A beaver in the game.
 * @extends GameObject
 */
var Beaver = Classe(GameObject, {
    /**
     * Initializes a Beaver with basic logic as provided by the Creer code generator. This is a good place to initialize sprites
     *
     * @memberof Beaver
     * @param {BeaverState} initialState - the initial state of this game object
     * @param {Game} game - the game this Beaver is in
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
    name: "Beaver",

    /**
     * The current state of this Beaver. Undefined when there is no current state.
     *
     * @type {BeaverState|null})}
     */
    current: null,

    /**
     * The next state of this Beaver. Undefined when there is no next state.
     *
     * @type {BeaverState|null})}
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
     * Called approx 60 times a second to update and render the Beaver. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {BeaverState} current - the current (most) game state, will be this.next if this.current is null
     * @param {BeaverState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    render: function(dt, current, next, reason, nextReason) {
        GameObject.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        
        if(current.health == 0) {  // Then beaver is dead.
            this.container.visible = false;
            return; // No need to render a dead beaver.
        }
        // otherwise, we have a (maybe) happy living beaver
        this.container.visible = true;

        var currentPosition.x = current.x;
        var currentPosition.y = current.y;
        var nextPosition.x = next.x;
        var nextPosition.y = next.y;

        if(!current.health == 0 && next.health == 0) { // Bever deded :c
            nextPosition = currentPosition; // Beaver must disappear
            this.container.alpha = ease(1 - dt, "cubicInout"); //We don't want to see beaver corpses
        }
        else
            this.container.alpha = 1; //ITS ALIVE

        // DO THE BEAVER DANCE MOVES
        this.container.x = ease(currentPosition.x, nextPosition.x, dt, "cubicInout");
        this.container.y = ease(currentPosition.y, nextPosition.y, dt, "cubicInout");

        //Add bottom offset here if desired

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
     * Attacks another adjacent beaver, and deals damage to their health.
     *
     * @param {TileState} tile - The tile of the beaver you want to attack.
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    attack: function(tile, callback) {
        this._runOnServer("attack", {
            tile: tile,
        }, callback);
    },

    /**
     * Builds a lodge on this tile. Requires 10 branches.
     *
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    build_lodge: function(callback) {
        this._runOnServer("build_lodge", {
        }, callback);
    },

    /**
     * Drops some of the given resource on the beaver's tile. Fish dropped in water disappear instantly, and fish dropped on land die one per tile per turn.
     *
     * @param {string} resource - The type of resource to drop ('branch' or 'fish').
     * @param {number} amount - The amount of the resource to drop.
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    drop: function(resource, amount, callback) {
        this._runOnServer("drop", {
            resource: resource,
            amount: amount,
        }, callback);
    },

    /**
     * Harvests the resource (created by a spawner) on an adjacent tile.
     *
     * @param {TileState} tile - The tile you want to harvest.
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    harvest: function(tile, callback) {
        this._runOnServer("harvest", {
            tile: tile,
        }, callback);
    },

    /**
     * Moves this beaver from its current tile to an adjacent tile.
     *
     * @param {TileState} tile - The tile this beaver should move to. Costs 2 moves normally, 3 if moving upstream, and 1 if moving downstream.
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    move: function(tile, callback) {
        this._runOnServer("move", {
            tile: tile,
        }, callback);
    },

    /**
     * Picks up all of the branches/fish on the beaver's tile. Must not be holding anything.
     *
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    pickup: function(callback) {
        this._runOnServer("pickup", {
        }, callback);
    },

    // /Joueur functions

    /**
     * Invoked when the state updates.
     *
     * @private
     * @param {BeaverState} current - the current (most) game state, will be this.next if this.current is null
     * @param {BeaverState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next, reason, nextReason) {
        GameObject._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update the Beaver based on its current and next states
        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add to this class can be perserved here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = Beaver;
