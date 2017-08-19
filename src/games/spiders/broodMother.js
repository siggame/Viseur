// This is a "class" to represent the BroodMother object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var Spider = require("./spider");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs
//<<-- /Creer-Merge: requires -->>

/**
 * @typedef {Object} BroodMotherState - A state representing a BroodMother
 * @property {number} eggs - How many eggs the BroodMother has to spawn Spiderlings this turn.
 * @property {string} gameObjectName - String representing the top level Class that this game object is an instance of. Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
 * @property {number} health - How much health this BroodMother has left. When it reaches 0, she dies and her owner loses.
 * @property {string} id - A unique id for each instance of a GameObject or a sub class. Used for client and server communication. Should never change value after being set.
 * @property {boolean} isDead - If this Spider is dead and has been removed from the game.
 * @property {Array.<string>} logs - Any strings logged will be stored here. Intended for debugging.
 * @property {NestState} nest - The Nest that this Spider is currently on. Null when moving on a Web.
 * @property {PlayerState} owner - The Player that owns this Spider, and can command it.
 */

/**
 * @class
 * @classdesc The Spider Queen. She alone can spawn Spiderlings for each Player, and if she dies the owner loses.
 * @extends Spider
 */
var BroodMother = Classe(Spider, {
    /**
     * Initializes a BroodMother with basic logic as provided by the Creer code generator. This is a good place to initialize sprites
     *
     * @memberof BroodMother
     * @param {BroodMotherState} initialState - the initial state of this game object
     * @param {Game} game - the game this BroodMother is in
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
    name: "BroodMother",

    /**
     * The current state of this BroodMother. Undefined when there is no current state.
     *
     * @type {BroodMotherState|null})}
     */
    current: null,

    /**
     * The next state of this BroodMother. Undefined when there is no next state.
     *
     * @type {BroodMotherState|null})}
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
     * Called approx 60 times a second to update and render the BroodMother. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {BroodMotherState} current - the current (most) game state, will be this.next if this.current is null
     * @param {BroodMotherState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    render: function(dt, current, next, reason, nextReason) {
        Spider.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // render where the BroodMother is
        //<<-- /Creer-Merge: render -->>
    },

    /**
     * Invoked after init or when a player changes their color, so we have a chance to recolor this GameObject's sprites
     */
    recolor: function() {
        Spider.recolor.apply(this, arguments);

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
     * Consumes a Spiderling of the same owner to regain some eggs to spawn more Spiderlings.
     *
     * @param {SpiderlingState} spiderling - The Spiderling to consume. It must be on the same Nest as this BroodMother.
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    consume: function(spiderling, callback) {
        this._runOnServer("consume", {
            spiderling: spiderling,
        }, callback);
    },

    /**
     * Spawns a new Spiderling on the same Nest as this BroodMother, consuming an egg.
     *
     * @param {string} spiderlingType - The string name of the Spiderling class you want to Spawn. Must be 'Spitter', 'Weaver', or 'Cutter'.
     * @param {Function} [callback] - callback that is passed back the return value of SpiderlingState once ran on the server
     */
    spawn: function(spiderlingType, callback) {
        this._runOnServer("spawn", {
            spiderlingType: spiderlingType,
        }, callback);
    },

    // /Joueur functions

    /**
     * Invoked when the state updates.
     *
     * @private
     * @param {BroodMotherState} current - the current (most) game state, will be this.next if this.current is null
     * @param {BroodMotherState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next, reason, nextReason) {
        Spider._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update the BroodMother based on its current and next states
        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add to this class can be perserved here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = BroodMother;
