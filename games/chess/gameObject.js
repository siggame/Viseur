// This is a "class" to represent the GameObject object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var BaseGameObject = require("viseur/game/baseGameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs
//<<-- /Creer-Merge: requires -->>

/**
 * @class
 * @classdesc An object in the game. The most basic class that all game classes should inherit from automatically.
 * @extends BaseGameObject
 */
var GameObject = Classe(BaseGameObject, {
    /**
     * Initializes a GameObject with basic logic as provided by the Creer code generator. This is a good place to initialize sprites
     *
     * @memberof GameObject
     * @private
     */
    init: function(initialState, game) {
        BaseGameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // init logic goes here
        //<<-- /Creer-Merge: init -->>
    },

    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "GameObject",

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
     * Called approx 60 times a second to update and render the GameObject. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     */
    render: function(dt) {
        BaseGameObject.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update and render where the GameObject is
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

        return [
            //<<-- Creer-Merge: _getContextMenu -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
            // add context menu items here
            //<<-- /Creer-Merge: _getContextMenu -->>
        ];
    },

    /**
     * Invoked when the state updates.
     *
     * @private
     */
    _stateUpdated: function() {
        BaseGameObject._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update the GameObject is based on its current and next states
        //<<-- /Creer-Merge: _stateUpdated -->>
    },


    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add to this class can be perserved here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = GameObject;
