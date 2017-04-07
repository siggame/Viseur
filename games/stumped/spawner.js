// This is a "class" to represent the Spawner object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

var STAGES = 4; // how many sprite we have for health

var SPRITE_PREFIX = {
    "branches": "tree_",
    "fish": "school_",
};

//<<-- /Creer-Merge: requires -->>

/**
 * @typedef {Object} SpawnerState - A state representing a Spawner
 * @property {string} gameObjectName - String representing the top level Class that this game object is an instance of. Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
 * @property {boolean} hasBeenHarvested - True if this Spawner has been harvested this turn, and it will not heal at the end of the turn, false otherwise.
 * @property {number} health - How much health this Spawner has, which is used to calculate how much of its resource can be harvested.
 * @property {string} id - A unique id for each instance of a GameObject or a sub class. Used for client and server communication. Should never change value after being set.
 * @property {Array.<string>} logs - Any strings logged will be stored here. Intended for debugging.
 * @property {TileState} tile - The Tile this Spawner is on.
 * @property {string} type - What type of resource this is ('food' or 'branches').
 */

/**
 * @class
 * @classdesc A resource spawner that generates branches or food.
 * @extends GameObject
 */
var Spawner = Classe(GameObject, {
    /**
     * Initializes a Spawner with basic logic as provided by the Creer code generator. This is a good place to initialize sprites
     *
     * @memberof Spawner
     * @param {SpawnerState} initialState - the initial state of this game object
     * @param {Game} game - the game this Spawner is in
     */
    init: function(initialState, game) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this._initContainer(this.game.layers.game);

        this.sprites = [];
        for(var i = 0; i < STAGES; i++) {
            this.sprites.push(
                this.renderer.newSprite(SPRITE_PREFIX[initialState.type] + i, this.container)
            );
        }

        this.container.x = initialState.tile.x;
        this.container.y = initialState.tile.y;

        //<<-- /Creer-Merge: init -->>
    },

    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "Spawner",

    /**
     * The current state of this Spawner. Undefined when there is no current state.
     *
     * @type {SpawnerState|null})}
     */
    current: null,

    /**
     * The next state of this Spawner. Undefined when there is no next state.
     *
     * @type {SpawnerState|null})}
     */
    next: null,

    // The following values should get overridden when delta states are merged, but we set them here as a reference for you to see what variables this class has.

    /**
     * Set this to `true` if this GameObject should be rendered.
     *
     * @static
     */
    //<<-- Creer-Merge: shouldRender -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    shouldRender: true,
    //<<-- /Creer-Merge: shouldRender -->>

    /**
     * Called approx 60 times a second to update and render the Spawner. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {SpawnerState} current - the current (most) game state, will be this.next if this.current is null
     * @param {SpawnerState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    render: function(dt, current, next, reason, nextReason) {
        GameObject.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // figure out the sprite indexes to render and if they should be faded in/out
        var currentIndex = Math.min(current.health, STAGES - 1);
        var nextIndex = Math.min(next.health, STAGES - 1);

        var fade = true;
        if(currentIndex === nextIndex) {
            nextIndex = -1; // won't show up
            fade = false;
        }

        // and render the appropriate sprites
        for(var i = 0; i < this.sprites.length; i++) {
            if(i === currentIndex) {
                this.sprites[i].visible = true;
                this.sprites[i].alpha = fade ? ease(1 - dt, "cubicInOut") : 1;
            }
            else if(i === nextIndex) { // can only occur on fade out
                this.sprites[i].visible = true;
                this.sprites[i].alpha = ease(dt, "cubicInOut");
            }
            else {
                this.sprites[i].visible = false;
            }
        }

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
     * @param {SpawnerState} current - the current (most) game state, will be this.next if this.current is null
     * @param {SpawnerState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next, reason, nextReason) {
        GameObject._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update the Spawner based on its current and next states
        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add to this class can be perserved here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = Spawner;
