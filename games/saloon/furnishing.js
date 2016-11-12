// This is a "class" to represent the Furnishing object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs
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

        this.x = initialState.tile.x;
        this.y = initialState.tile.y;

        this._maxHealth = initialState.health;

        this._initContainer(this.game.layers.game);
        this.sprite = this.renderer.newSprite(initialState.isPiano ? "piano": "furnishing", this.container);

        if(initialState.isPiano) {
            // then it needs music sprites too
            this._musicSprite = this.renderer.newSprite("music", this.game.layers.music);
            this._musicSprite.x = this.x;
        }

        this.container.x = this.x;
        this.container.y = this.y;

        this.healthBarBg = this.renderer.newSprite("", this.container);
        this.healthBarBg.scale.y *= 0.066;
        this.healthBarBg.filters = [ Color("black").colorMatrixFilter() ];

        this.healthBar = this.renderer.newSprite("", this.container);
        this.healthBar.scale.y *= 0.066;
        this._maxXScale = this.healthBar.scale.x;
        this.healthBar.filters = [ Color("green").colorMatrixFilter() ];

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

            if(this._musicSprite) {
                this._musicSprite.visible = false;
            }
        }
        else {
            this.container.visible = true;
            this.healthBar.scale.x = ease(current.health, next.health, dt, "cubicInOut") /this._maxHealth * this._maxXScale;
            if(next.isDestroyed) {
                this.container.alpha = ease(1 - dt, "cubicInOut"); // fade it out as it's destroyed
            }
            else {
                this.container.alpha = 1;
            }

            if(this._musicSprite) {
                if(current.isPlaying || next.isPlaying) {
                    this._musicSprite.visible = true;

                    var alpha = 1;
                    var y = this.y;
                    if(!current.isPlaying && next.isPlaying) { // music notes need to move up
                        alpha = ease(dt, "cubicInOut");
                        y -= alpha/2;
                    }
                    else if(current.isPlaying && !next.isPlaying) { // music notes need to move down
                        alpha = ease(1 - dt, "cubicInOut");
                        y -= alpha/2;
                    }
                    else { // current and next isPlaying
                        y -= 0.5;
                    }

                    this._musicSprite.alpha = alpha;
                    this._musicSprite.y = y;
                }
                else {
                    this._musicSprite.visible = false;
                }
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
    _stateUpdated: function(current, next, reason, nextReason) {
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
