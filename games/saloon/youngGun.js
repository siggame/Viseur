// This is a "class" to represent the YoungGun object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs
//<<-- /Creer-Merge: requires -->>

/**
 * @typedef {Object} YoungGunState - A state representing a YoungGun
 * @property {TileState} callInTile - The Tile that a Cowboy will be called in on if this YoungGun calls in a Cowboy.
 * @property {boolean} canCallIn - True if the YoungGun can call in a Cowboy, false otherwise.
 * @property {string} gameObjectName - String representing the top level Class that this game object is an instance of. Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
 * @property {string} id - A unique id for each instance of a GameObject or a sub class. Used for client and server communication. Should never change value after being set.
 * @property {Array.<string>} logs - Any strings logged will be stored here. Intended for debugging.
 * @property {PlayerState} owner - The Player that owns and can control this YoungGun.
 * @property {TileState} tile - The Tile this YoungGun is currently on.
 */

/**
 * @class
 * @classdesc An eager young person that wants to join your gang, and will call in the veteran Cowboys you need to win the brawl in the saloon.
 * @extends GameObject
 */
var YoungGun = Classe(GameObject, {
    /**
     * Initializes a YoungGun with basic logic as provided by the Creer code generator. This is a good place to initialize sprites
     *
     * @memberof YoungGun
     * @param {YoungGunState} initialState - the initial state of this game object
     * @param {Game} game - the game this YoungGun is in
     */
    init: function(initialState, game) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this._initContainer(this.game.layers.game);
        this.spriteBottom = this.renderer.newSprite("young-gun_bottom", this.container);
        this.spriteTop = this.renderer.newSprite("young-gun_top", this.container);

        var owner = game.gameObjects[initialState.owner.id];
        if(owner.id === "0") { // then they are first player, so flip them
            this.spriteBottom.scale.x *= -1;
            this.spriteBottom.anchor.x += 1;
            this.spriteTop.scale.x *= -1;
            this.spriteTop.anchor.x += 1;
        }

        // color the top of the sprite as the player's color
        this.spriteTop.filters = [ owner.getColor().colorMatrixFilter() ];

        //<<-- /Creer-Merge: init -->>
    },

    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "YoungGun",

    /**
     * The current state of this YoungGun. Undefined when there is no current state.
     *
     * @type {YoungGunState|null})}
     */
    current: null,

    /**
     * The next state of this YoungGun. Undefined when there is no next state.
     *
     * @type {YoungGunState|null})}
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
     * Called approx 60 times a second to update and render the YoungGun. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {YoungGunState} current - the current (most) game state, will be this.next if this.current is null
     * @param {YoungGunState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    render: function(dt, current, next, reason, nextReason) {
        GameObject.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.container.x = ease(current.tile.x, next.tile.x, dt, "cubicInOut");
        this.container.y = ease(current.tile.y, next.tile.y, dt, "cubicInOut");

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
     * Tells the YoungGun to call in a new Cowboy of the given job to the open Tile nearest to them.
     *
     * @param {string} job - The job you want the Cowboy being brought to have.
     * @param {Function} [callback] - callback that is passed back the return value of CowboyState once ran on the server
     */
    callIn: function(job, callback) {
        this._runOnServer("callIn", {
            job: job,
        }, callback);
    },

    // /Joueur functions

    /**
     * Invoked when the state updates.
     *
     * @private
     * @param {YoungGunState} current - the current (most) game state, will be this.next if this.current is null
     * @param {YoungGunState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next, reason, nextReason) {
        GameObject._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // Draw to balcony layer when on bottom row to be drawn in front of rail
        if(current.tile.tileSouth) {
            this.container.setParent(this.game.layers.game);
        }
        else {
            this.container.setParent(this.game.layers.balcony);
        }
        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add to this class can be perserved here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = YoungGun;
