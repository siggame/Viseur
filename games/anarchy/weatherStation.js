// This is a "class" to represent the WeatherStation object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var Building = require("./building");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs
//<<-- /Creer-Merge: requires -->>

/**
 * @typedef {Object} WeatherStationState - A state representing a WeatherStation
 * @property {boolean} bribed - When true this building has already been bribed this turn and cannot be bribed again this turn.
 * @property {BuildingState} buildingEast - The Building directly to the east of this building, or null if not present.
 * @property {BuildingState} buildingNorth - The Building directly to the north of this building, or null if not present.
 * @property {BuildingState} buildingSouth - The Building directly to the south of this building, or null if not present.
 * @property {BuildingState} buildingWest - The Building directly to the west of this building, or null if not present.
 * @property {number} fire - How much fire is currently burning the building, and thus how much damage it will take at the end of its owner's turn. 0 means no fire.
 * @property {string} gameObjectName - String representing the top level Class that this game object is an instance of. Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
 * @property {number} health - How much health this building currently has. When this reaches 0 the Building has been burned down.
 * @property {string} id - A unique id for each instance of a GameObject or a sub class. Used for client and server communication. Should never change value after being set.
 * @property {boolean} isHeadquarters - True if this is the Headquarters of the owning player, false otherwise. Burning this down wins the game for the other Player.
 * @property {Array.<string>} logs - Any strings logged will be stored here. Intended for debugging.
 * @property {PlayerState} owner - The player that owns this building. If it burns down (health reaches 0) that player gets an additional bribe(s).
 * @property {number} x - The location of the Building along the x-axis.
 * @property {number} y - The location of the Building along the y-axis.
 */

/**
 * @class
 * @classdesc Can be bribed to change the next Forecast in some way.
 * @extends Building
 */
var WeatherStation = Classe(Building, {
    /**
     * Initializes a WeatherStation with basic logic as provided by the Creer code generator. This is a good place to initialize sprites
     *
     * @memberof WeatherStation
     * @param {WeatherStationState} initialState - the initial state of this game object
     * @param {Game} game - the game this WeatherStation is in
     */
    init: function(initialState, game) {
        Building.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // initialization logic goes here

        this.intensitySprite = this.renderer.newSprite("arrow", this.game.layers.beams);
        this.intensitySprite.setRelativePivot(0.5, 0.5);
        this.intensitySprite.position.set(initialState.x + 0.5, initialState.y + 0.5);

        this.rotationSprite = this.renderer.newSprite("rotation", this.game.layers.beams);
        this.rotationSprite.setRelativePivot(0.5, 0.5);
        this.rotationSprite.position.set(initialState.x + 0.5, initialState.y + 0.5);

        //<<-- /Creer-Merge: init -->>
    },

    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "WeatherStation",

    /**
     * The current state of this WeatherStation. Undefined when there is no current state.
     *
     * @type {WeatherStationState|null})}
     */
    current: null,

    /**
     * The next state of this WeatherStation. Undefined when there is no next state.
     *
     * @type {WeatherStationState|null})}
     */
    next: null,

    // The following values should get overridden when delta states are merged, but we set them here as a reference for you to see what variables this class has.

    /**
     * Set this to `true` if this GameObject should be rendered.
     *
     * @static
     */
    //<<-- Creer-Merge: shouldRender -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    shouldRender: true, // Yes we want to show them
    //<<-- /Creer-Merge: shouldRender -->>

    /**
     * Called approx 60 times a second to update and render the WeatherStation. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {WeatherStationState} current - the current (most) game state, will be this.next if this.current is null
     * @param {WeatherStationState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    render: function(dt, current, next, reason, nextReason) {
        Building.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // render where the WeatherStation is

        var direction;

        if(this.rotationSprite.visible) {
            direction = this.rotationSprite.scale.x > 0 ? 1 : -1;
            this.rotationSprite.rotation = direction * Math.PI * ease(dt, "cubicIn");
        }

        if(this.intensitySprite.visible) {
            direction = this.intensitySprite.rotation === 0 ? 1 : -1;
            this.intensitySprite.y = current.y - direction * ease(dt, "cubicIn");
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

    /**
     * Bribe the weathermen to intensity the next Forecast by 1 or -1
     *
     * @param {boolean} [negative] - By default the intensity will be increased by 1, setting this to true decreases the intensity by 1.
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    intensify: function(negative, callback) {
        if(arguments.length <= 0) {
            negative = false;
        }

        this._runOnServer("intensify", {
            negative: negative,
        }, callback);
    },

    /**
     * Bribe the weathermen to change the direction of the next Forecast by rotating it clockwise or counterclockwise.
     *
     * @param {boolean} [counterclockwise] - By default the direction will be rotated clockwise. If you set this to true we will rotate the forecast counterclockwise instead.
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    rotate: function(counterclockwise, callback) {
        if(arguments.length <= 0) {
            counterclockwise = false;
        }

        this._runOnServer("rotate", {
            counterclockwise: counterclockwise,
        }, callback);
    },

    // /Joueur functions

    /**
     * Invoked when the state updates.
     *
     * @private
     * @param {WeatherStationState} current - the current (most) game state, will be this.next if this.current is null
     * @param {WeatherStationState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next, reason, nextReason) {
        Building._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update the WeatherStation based on its current and next states

        this.rotationSprite.visible = false;
        this.rotationSprite.scale.x = Math.abs(this.rotationSprite.scale.x);

        this.intensitySprite.visible = false;
        this.intensitySprite.rotation = 0;

        if(nextReason && nextReason.run && nextReason.run.caller === this && nextReason.returned === true) {
            if(nextReason.run.functionName === "rotate") {
                this.rotationSprite.visible = true;
                this.rotationSprite.scale.x *= nextReason.run.args.counterclockwise ? -1 : 1;
            }
            else { // "intensify"
                this.intensitySprite.visible = true;
                var negative = nextReason.run.args.negative;
                this.intensitySprite.rotation = negative ? Math.PI : 0; // rotate the arrow 180 degrees, so flip is basically
            }
        }

        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add to this class can be perserved here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = WeatherStation;
