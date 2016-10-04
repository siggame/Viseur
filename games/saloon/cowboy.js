// This is a "class" to represent the Cowboy object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs

var green_hue = 120; // hue for green in degrees
var greenish_hue = green_hue/2; // mid tone green for transitioning between greens in drunk phase
var default_hue = 0; // default hue in degrees, 0 means no extra hue applied
//<<-- /Creer-Merge: requires -->>

/**
 * @typedef {Object} CowboyID - a "shallow" state of a Cowboy, which is just an object with an `id`.
 * @property {string} id - the if of the CowboyState it represents in game.gameObjects
 */

/**
 * @typedef {Object} CowboyState - A state representing a Cowboy
 * @property {boolean} canMove - If the Cowboy can be moved this turn via its owner.
 * @property {string} drunkDirection - The direction this Cowboy is moving while drunk. Will be 'North', 'East', 'South', or 'West' when drunk; or '' (empty string) when not drunk.
 * @property {number} focus - How much focus this Cowboy has. Different Jobs do different things with their Cowboy's focus.
 * @property {string} gameObjectName - String representing the top level Class that this game object is an instance of. Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
 * @property {number} health - How much health this Cowboy currently has.
 * @property {string} id - A unique id for each instance of a GameObject or a sub class. Used for client and server communication. Should never change value after being set.
 * @property {boolean} isDead - If this Cowboy is dead and has been removed from the game.
 * @property {boolean} isDrunk - If this Cowboy is drunk, and will automatically walk.
 * @property {string} job - The job that this Cowboy does, and dictates how they fight and interact within the Saloon.
 * @property {Array.<string>} logs - Any strings logged will be stored here. Intended for debugging.
 * @property {PlayerID} owner - The Player that owns and can control this Cowboy.
 * @property {TileID} tile - The Tile that this Cowboy is located on.
 * @property {number} tolerance - How many times this unit has been drunk before taking their siesta and reseting this to 0.
 * @property {number} turnsBusy - How many turns this unit has remaining before it is no longer busy and can `act()` or `play()` again.
 */

/**
 * @class
 * @classdesc A person on the map that can move around and interact within the saloon.
 * @extends GameObject
 */
var Cowboy = Classe(GameObject, {
    /**
     * Initializes a Cowboy with basic logic as provided by the Creer code generator. This is a good place to initialize sprites
     *
     * @memberof Cowboy
     * @private
     */
    init: function(initialState, game) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this._initContainer(this.game.layers.game);
        this.sprite = this.renderer.newSprite("cowboy", this.container);
        //creating filter for use in changin color of cowboy
        this._colorFilter = new PIXI.filters.ColorMatrixFilter();
        // default matrix used, multiplies 1 by all RGBA values
        this._colorFilter.matrix = [1, 0, 0, 0, 0, 
                                    0, 1, 0, 0, 0, 
                                    0, 0, 1, 0, 0, 
                                    0, 0, 0, 1, 0]; 

        // setting default hue for the colorfilter 
        this._colorFilter.hue(default_hue, false);
        //<<-- /Creer-Merge: init -->>
    },

    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "Cowboy",

    /**
     * The current state of this Cowboy. Undefined when there is no current state.
     *
     * @type {CowboyState|null})}
     */
    current: null,

    /**
     * The next state of this Cowboy. Undefined when there is no next state.
     *
     * @type {CowboyState|null})}
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
     * Called approx 60 times a second to update and render the Cowboy. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {Object} current - the current (most) game state, will be this.next if this.current is null
     * @param {Object} next - the next (most) game state, will be this.current if this.next is null
     */
    render: function(dt, current, next) {
        GameObject.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.container.visible = !current.isDead;

        if(current.isDead) {
            return; // no need to render further
        }

        this.container.alpha = 1;

        var nextTile = next.tile;
        if(next.isDead) {
            nextTile = current.tile; // it would normally be null, this way we can render it on it's tile of death
            this.container.alpha = dt; // fade it out
        }

        this.container.x = ease(current.tile.x, nextTile.x, dt, "cubicInOut");
        this.container.y = ease(current.tile.y, nextTile.y, dt, "cubicInOut");

        // setting the current colorfilter for the given render container
        this.container.filters = [this._colorFilter];
        var ease_hue;
        // if the next frame has drunk
        if(next.isDrunk) {
            // we'll want to create a transition to green.
            ease_hue = ease(default_hue, green_hue, dt, "cubicInOut");
            this._colorFilter.hue(ease_hue, false);
        }
        // if current is drunk
        else if(current.isDrunk) {
            // make sure that we transition out of green if the next frame isn't drunk
            if(!next.isDrunk) {
                ease_hue = ease(green_hue, default_hue, dt, "cubicInOut");
                this._colorFilter.hue(ease_hue, false);
            }
            //otherwise stay green and fluxuate the color hue

            // easing to less green for fluxuation
            if (dt <= 0.5) {
                ease_hue = ease(green_hue, greenish_hue, dt, "sineInOut");
            }
            // easing to more green for fluxuation
            else{
                ease_hue = ease(greenish_hue, green_hue, dt, "sineInOut");
            }
            this._colorFilter.hue(ease_hue, false);
        }
        //otherwise keep no hue
        else {
            this._colorFilter.hue(default_hue, false);
        }
        //console.log(this.container.filters);

        //this._colorFilter.matrix = [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];

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
     * Does their job's action on a Tile.
     *
     * @param {TileID} tile - The Tile you want this Cowboy to act on.
     * @param {string} [drunkDirection] - The direction the bottle will cause drunk cowboys to be in, can be 'North', 'East', 'South', or 'West'.
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    act: function(tile, drunkDirection, callback) {
        if(arguments.length <= 1) {
            drunkDirection = "";
        }

        this._runOnServer("act", {
            tile: tile,
            drunkDirection: drunkDirection,
        }, callback);
    },

    /**
     * Moves this Cowboy from its current Tile to an adjacent Tile.
     *
     * @param {TileID} tile - The Tile you want to move this Cowboy to.
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    move: function(tile, callback) {
        this._runOnServer("move", {
            tile: tile,
        }, callback);
    },

    /**
     * Sits down and plays a piano.
     *
     * @param {FurnishingID} piano - The Furnishing that is a piano you want to play.
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    play: function(piano, callback) {
        this._runOnServer("play", {
            piano: piano,
        }, callback);
    },

    // /Joueur functions

    /**
     * Invoked when the state updates.
     *
     * @private
     * @param {Object} current - the current (most) game state, will be this.next if this.current is null
     * @param {Object} next - the next (most) game state, will be this.current if this.next is null
     */
    _stateUpdated: function(current, next) {
        GameObject._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update the Cowboy based on its current and next states
        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add to this class can be perserved here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = Cowboy;
