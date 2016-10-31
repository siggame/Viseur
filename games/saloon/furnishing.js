// This is a "class" to represent the Furnishing object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs

// contains the array of textures for furnishings, excluding piano, that can possibly be randomly selected for.
// if you add a new furnishing add the name of it here.
var furnishingTextures = ["furnishing", "furnishing chair", "furnishing lamp", "furnishing sofa", "furnishing table"];

//<<-- /Creer-Merge: requires -->>

/**
 * @typedef {Object} FurnishingState - A state representing a Furnishing
 * @property {string} gameObjectName - String representing the top level Class that this game object is an instance of. Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
 * @property {number} health - How much health this Furnishing currently has.
 * @property {string} id - A unique id for each instance of a GameObject or a sub class. Used for client and server communication. Should never change value after being set.
 * @property {boolean} isDestroyed - If this Furnishing has been destroyed, and has been removed from the game.
 * @property {boolean} isPiano - True if this Furnishing is a piano and can be played, False otherwise.
 * @property {boolean} isPlaying - If this is a piano and a Cowboy is playing it this turn.
 * @property {Array.<string>} logs - Any strings logged will be stored here. Intended for debugging.
 * @property {TileState} tile - The Tile that this Furnishing is located on.
 */

/**
 * @class
 * @classdesc An furnishing in the Saloon that must be pathed around, or destroyed.
 * @extends GameObject
 */
var Furnishing = Classe(GameObject, {
    /**
     * Initializes a Furnishing with basic logic as provided by the Creer code generator. This is a good place to initialize sprites
     *
     * @memberof Furnishing
     * @param {FurnishingState} initialState - the initial state of this game object
     * @param {Game} game - the game this Furnishing is in
     */
    init: function(initialState, game) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this._initContainer(this.game.layers.game);
        // getting deterministic PRN between 0 -> furnishingTextures.length() - 1, since random is 0->1 exclusive on 1,
        // truncating will give us integers only in the desired range
        var selection = Math.floor(this.game.random() * furnishingTextures.length);
        // despite the fact that this can be inlined inside of sprite assignment, it's more readable as a seperate variable,
        // and can be added as a member later if need be.  Gets the string for the selected non piano texture
        var selectedTexture = furnishingTextures[selection];
        this.sprite = this.renderer.newSprite(initialState.isPiano ? "piano": selectedTexture, this.container);

        this.container.x = initialState.tile.x;
        this.container.y = initialState.tile.y;

        //<<-- /Creer-Merge: init -->>
    },

    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "Furnishing",

    /**
     * The current state of this Furnishing. Undefined when there is no current state.
     *
     * @type {FurnishingState|null})}
     */
    current: null,

    /**
     * The next state of this Furnishing. Undefined when there is no next state.
     *
     * @type {FurnishingState|null})}
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
     * Called approx 60 times a second to update and render the Furnishing. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {FurnishingState} current - the current (most) game state, will be this.next if this.current is null
     * @param {FurnishingState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    render: function(dt, current, next, reason, nextReason) {
        GameObject.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if(current.isDestroyed) {
            this.container.visible = false;
        }
        else {
            this.container.visible = true;

            if(next.isDestroyed) {
                this.container.alpha = ease(1 - dt, "cubicInOut"); // fade it out as it's destroyed
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
     * @param {FurnishingState} current - the current (most) game state, will be this.next if this.current is null
     * @param {FurnishingState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next) {
        GameObject._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update the Furnishing based on its current and next states
        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add to this class can be perserved here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = Furnishing;
