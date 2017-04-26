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
 * @typedef {Object} BottleState - A state representing a Bottle
 * @property {string} direction - The Direction this Bottle is flying and will move to between turns, can be 'North', 'East', 'South', or 'West'.
 * @property {string} drunkDirection - The direction any Cowboys hit by this will move, can be 'North', 'East', 'South', or 'West'.
 * @property {string} gameObjectName - String representing the top level Class that this game object is an instance of. Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
 * @property {string} id - A unique id for each instance of a GameObject or a sub class. Used for client and server communication. Should never change value after being set.
 * @property {boolean} isDestroyed - True if this Bottle has impacted and has been destroyed (removed from the Game). False if still in the game flying through the saloon.
 * @property {Array.<string>} logs - Any strings logged will be stored here. Intended for debugging.
 * @property {TileState} tile - The Tile this bottle is currently flying over.
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
     * @param {BottleState} initialState - the initial state of this game object
     * @param {Game} game - the game this Bottle is in
     */
    init: function(initialState, game) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this._initContainer(this.game.layers.game);
        this.sprite = this.renderer.newSprite("bottle", this.container);

        // set the anchor to the center of the sprite, then offset it by that amount, so the bottle can spin when animating
        this.sprite.scale.x *= 0.75;
        this.sprite.scale.y *= 0.75;
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite.position.x = 0.5;
        this.sprite.position.y = 0.5;

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
     * @type {BottleState|null})}
     */
    current: null,

    /**
     * The next state of this Bottle. Undefined when there is no next state.
     *
     * @type {BottleState|null})}
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
     * Called approx 60 times a second to update and render the Bottle. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {BottleState} current - the current (most) game state, will be this.next if this.current is null
     * @param {BottleState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    render: function(dt, current, next, reason, nextReason) {
        GameObject.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.container.visible = !current.isDestroyed;
        if(current.isDestroyed) {
            return; // no need to render further
        }

        this.container.alpha = 1;

        // if for the next state it died, fade it out
        var nextTile = next.tile;
        if(next.isDestroyed) {
            nextTile = current.tile; // it would normally be null, this way we can render it on it's tile of death
            this.container.alpha = ease(1 - dt, "cubicInOut"); // fade it out
        }

        // if this did not exist at first, fade it in
        if(!this.current) {
            this.container.alpha = ease(dt, "cubicInOut");
        }

        // rotate the bottle based on real tile when not paused
        if(this._lastDT !== dt) {
            this._lastDT = dt;
            this.sprite.rotation = 2*Math.PI * new Date().getTime() / 1000; // rotate at a constant rate, not dependent on dt
        }

        this.container.x = ease(current.tile.x, nextTile.x, dt, "linear");
        this.container.y = ease(current.tile.y, nextTile.y, dt, "linear");

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
     * @param {BottleState} current - the current (most) game state, will be this.next if this.current is null
     * @param {BottleState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next, reason, nextReason) {
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
