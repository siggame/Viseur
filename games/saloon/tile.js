// This is a "class" to represent the Tile object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs
//<<-- /Creer-Merge: requires -->>

/**
 * @typedef {Object} TileState - A state representing a Tile
 * @property {BottleState} bottle - The beer Bottle currently flying over this Tile.
 * @property {CowboyState} cowboy - The Cowboy that is on this Tile, null otherwise.
 * @property {FurnishingState} furnishing - The furnishing that is on this Tile, null otherwise.
 * @property {string} gameObjectName - String representing the top level Class that this game object is an instance of. Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
 * @property {boolean} hasHazard - If this Tile is pathable, but has a hazard that damages Cowboys that path through it.
 * @property {string} id - A unique id for each instance of a GameObject or a sub class. Used for client and server communication. Should never change value after being set.
 * @property {boolean} isBalcony - If this Tile is a balcony of the Saloon that YoungGuns walk around on, and can never be pathed through by Cowboys.
 * @property {Array.<string>} logs - Any strings logged will be stored here. Intended for debugging.
 * @property {TileState} tileEast - The Tile to the 'East' of this one (x+1, y). Null if out of bounds of the map.
 * @property {TileState} tileNorth - The Tile to the 'North' of this one (x, y-1). Null if out of bounds of the map.
 * @property {TileState} tileSouth - The Tile to the 'South' of this one (x, y+1). Null if out of bounds of the map.
 * @property {TileState} tileWest - The Tile to the 'West' of this one (x-1, y). Null if out of bounds of the map.
 * @property {number} x - The x (horizontal) position of this Tile.
 * @property {number} y - The y (vertical) position of this Tile.
 * @property {YoungGunState} youngGun - The YoungGun on this tile, null otherwise.
 */

/**
 * @class
 * @classdesc A Tile in the game that makes up the 2D map grid.
 * @extends GameObject
 */
var Tile = Classe(GameObject, {
    /**
     * Initializes a Tile with basic logic as provided by the Creer code generator. This is a good place to initialize sprites
     *
     * @memberof Tile
     * @param {TileState} initialState - the intial state of this game object
     * @param {Game} game - the game this Tile is in
     */
    init: function(initialState, game) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this._initContainer(this.game.layers.game);

        this.sprite = this.renderer.newSprite(initialState.isBalcony ? "wall" : "tile", this.container);

        if(initialState.hasHazard) {
            this.hazardSprite = this.renderer.newSprite("hazard_broken_glass", this.container);
        }

        this.container.x = initialState.x;
        this.container.y = initialState.y;

        //<<-- /Creer-Merge: init -->>
    },

    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "Tile",

    /**
     * The current state of this Tile. Undefined when there is no current state.
     *
     * @type {TileState|null})}
     */
    current: null,

    /**
     * The next state of this Tile. Undefined when there is no next state.
     *
     * @type {TileState|null})}
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
     * Called approx 60 times a second to update and render the Tile. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {TileState} current - the current (most) game state, will be this.next if this.current is null
     * @param {TileState} next - the next (most) game state, will be this.current if this.next is null
     */
    render: function(dt, current, next) {
        GameObject.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // render where the Tile is
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
     * @param {TileState} current - the current (most) game state, will be this.next if this.current is null
     * @param {TileState} next - the next (most) game state, will be this.current if this.next is null
     */
    _stateUpdated: function(current, next) {
        GameObject._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if(this.current && this.next) {
            // If hazard removed
            if(this.current.hasHazard && !this.next.hasHazard) {
                this.hazardSprite.opacity = 0;
            }
            // If added and sprite already exists
            else if(this.hazardSprite && !this.current.hasHazard && this.next.hasHazard) {
                this.hazardSprite.opacity = 1;
            }
            // If added and sprite doesn't exist
            else if(!this.hazardSprite && !this.current.hasHazard && this.next.hasHazard) {
                this.hazardSprite = this.renderer.newSprite("hazard_broken_glass", this.container);
            }
        }

        // update the Tile based on its current and next states
        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add to this class can be perserved here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = Tile;
