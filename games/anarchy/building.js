// This is a "class" to represent the Building object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs
// This is the number of frames in the "fire" sprite, we use this to bound a number between the range [0, 5]
var FIRE_FRAMES = 5;

var updown = require("core/utils").updown;
//<<-- /Creer-Merge: requires -->>

/**
 * @typedef {Object} BuildingState - A state representing a Building
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
 * @classdesc A basic building. It does nothing besides burn down. Other Buildings inherit from this class.
 * @extends GameObject
 */
var Building = Classe(GameObject, {
    /**
     * Initializes a Building with basic logic as provided by the Creer code generator. This is a good place to initialize sprites
     *
     * @memberof Building
     * @param {BuildingState} initialState - the initial state of this game object
     * @param {Game} game - the game this Building is in
     */
    init: function(initialState, game) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // initialize our container, after this call, `this.container` will be set to a PIXI.Container, which will be a child of our game's 'game' layer. Background objects should probably go in the 'background', e.g. `this.game.layers.background`
        this._initContainer(this.game.layers.game);

        // our owner's Player instance, needed to recolor ourself
        this.owner = this.game.gameObjects[initialState.owner.id];

        // the "alive" building will have a top and bottom sprite, which we can put in this container and threat them as one "object" for the purposes for hiding and showing
        this.aliveContainer = new PIXI.Container();
        this.aliveContainer.setParent(this.container);

        // this will be the sprite that shows our building, and we want to put it inside our container
        // the sprite key is just our class name (gameObjectName), which is set to the appropriate sprite in textures/index.js
        var baseTextureName = initialState.gameObjectName.toLowerCase(); // this is defensive programming. We don't know if it will be upper or lower case, so we make sure it will always be lower case regardless

        // the back sprite are neutral colors
        this.buildingSpriteBack = this.renderer.newSprite(baseTextureName + "_back", this.aliveContainer);

        // and the front is a white map we will re-color to the team's color
        this.buildingSpriteFront = this.renderer.newSprite(baseTextureName + "_front", this.aliveContainer);

        // when we die we need to look burnt up, so we want to initialize that sprite too
        this.deadSprite = this.renderer.newSprite("dead", this.container);

        this._initBar(this.container, {
            width: 0.9,
            maxValue: initialState.health,
        });

        // now we need some nice fire sprites, notice they are a sprite sheet,
        // so we want a sprite for each part of the sheet
        this.fireSprites = [];
        for(var i = 0; i < FIRE_FRAMES; i++) {
            this.fireSprites.push(this.renderer.newSprite("fire@" + i, this.container));
        }

        var min = -0.03;
        var max = 0.03;
        this._randomX = Math.random() * (max - min) + min;
        this._randomY = Math.random() * (max - min) + min;

        // the headquarters has no unique sprite, but instead a graffiti marking to easily make it stand out
        if(initialState.isHeadquarters) {
            // we have two players with id "0" and "1", so we use that to quickly get their graffiti sprite
            this.graffitiSprite = this.renderer.newSprite("graffiti_" + initialState.owner.id, this.aliveContainer);
            // make it partially transparent because it looks nicer
            this.graffitiSprite.alpha = 0.9;
        }

        // when we are the target on an attack, we'll highlight ourself so it's clear we are under attack
        this.targetedSprite = this.renderer.newSprite("beam", this.container);
        this.targetedSprite.alpha = 0.666; // make it partially opaque so people can still tell what building we are
        this.targetedSprite.filters = [ Color("red").colorMatrixFilter() ]; // recolor to red

        if(initialState.gameObjectName !== "WeatherStation") {
            // all the building types shoot beams for animations, except WeatherStations, we we'll just aggregate the logic here
            this.beamSprite = this.renderer.newSprite("beam", this.game.layers.beams);
            this.beamSprite.filters = [ Color(this.beamColor).colorMatrixFilter() ];
        }

        // also buildings never move, so let's move them right now (normally you'd do that in render() if they moved dynamically)
        // Notice we move the container's (x, y), this is because that moves it's child sprites, the buildingSprite and deadSprite. That way we can move 1 object and all the child nodes move too!
        this.container.x = initialState.x;
        this.container.y = initialState.y;

        //<<-- /Creer-Merge: init -->>
    },

    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "Building",

    /**
     * The current state of this Building. Undefined when there is no current state.
     *
     * @type {BuildingState|null})}
     */
    current: null,

    /**
     * The next state of this Building. Undefined when there is no next state.
     *
     * @type {BuildingState|null})}
     */
    next: null,

    /**
     * Set this to `true` if this GameObject should be rendered.
     *
     * @static
     */
    //<<-- Creer-Merge: shouldRender -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    shouldRender: true, // NOTE: we manually set this to true, as buildings should be (re)rendered a lot
    //<<-- /Creer-Merge: shouldRender -->>

    /**
     * Called approx 60 times a second to update and render the Building. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {BuildingState} current - the current (most) game state, will be this.next if this.current is null
     * @param {BuildingState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    render: function(dt, current, next, reason, nextReason) {
        GameObject.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // render where the Building is

        // show our building sprite, as it's probably visible, and if not we'll set it to false later
        this.aliveContainer.alpha = 1;
        this.aliveContainer.visible = true;

        // if we are being targeted, then display out targetedSprite
        var run = nextReason && nextReason.run;
        var beingTargeted = run && (run.args.building === this || run.args.warehouse === this);
        this.targetedSprite.visible = beingTargeted;
        // and fade it out
        var targetedAlpha = ease(1 -dt, "cubicInOut");
        this.targetedSprite.alpha = targetedAlpha;

        var deadInBothStates = false;
        if(current.health === 0 || next.health === 0) {
            // it died at some point, so make the dead sprite visible
            this.deadSprite.visible = true;

            var alpha = 1; // we want to fade in/out the sprite based on if it currently died or not, so we will use the alpha channel
            if(current.health === 0 && next.health === 0) {
                // it is dead, and remains dead, so just hide our normal sprite
                deadInBothStates = true;
                this.aliveContainer.visible = false;
            }
            else { // current.health !== 0 && next.health === 0, which means it burned down :(
                alpha = ease(dt, "cubicInOut"); // dt goes from 0 to 1, so at 0 we are not buned down, but as 1 we are
                this.aliveContainer.alpha = 1 - alpha; // we want to ease out the buildingSprite in the opposite direction
            }
            // else keep alpha at 1

            this.deadSprite.alpha = alpha;
        }
        else {
            // it had health through both states, so don't show the dead building sprite
            this.deadSprite.visible = false;
        }

        // update their health bar, if they want it to be displayed
        var displayHealthBar = this.game.getSetting("display-health-bars") && !deadInBothStates;
        this._setBarVisible(displayHealthBar);
        if(displayHealthBar) {
            // then update the health
            this._updateBar(ease(current.health, next.health, dt, "cubicInOut"));
        }

        // now the correct building sprite is displayed
        // so let's look at the fire!

        for(var i = 0; i < FIRE_FRAMES; i++) {
            this.fireSprites[i].visible = false;
        }

        // for we need to figure out which fire sprite to use
        // we'll scale our current fire in the range [0, 20] to the sprite range [0, 5]
        var percentOnFire = current.fire / this.game.maxFire; // now we know a percentage of how "on fire" we are
        if(percentOnFire > 0) {
            // scale that percent to the fire sprite sheet index to represent how on fire we are
            var fireIndex = Math.round(percentOnFire * (FIRE_FRAMES-1));
            var fireSprite = this.fireSprites[fireIndex];
            fireSprite.visible = true;

            if(this.game.getSetting("animate-fire")) {
                var ud = updown(dt);
                fireSprite.position.set(this._randomX*ud, this._randomY*ud);
            }
        }

        // if we have a beam sprite, and it's visible, fade its alpha
        if(this.beamSprite && this.beamSprite.visible) {
            this.beamSprite.alpha = targetedAlpha; // re-use the alpha as we are the one targeting
        }

        //<<-- /Creer-Merge: render -->>
    },

    /**
     * Invoked after init or when a player changes their color, so we have a chance to recolor this GameObject's sprites
     */
    recolor: function() {
        GameObject.recolor.apply(this, arguments);

        //<<-- Creer-Merge: recolor -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // replace with code to recolor sprites based on player color

        // by adding their' owner's color's PIXI.ColorMatrixFilter, we recolor the sprite.
        // e.g. if a pixel is [1, 1, 1] (white) * [1, 0, 0.1] (red with a hint of blue) = [1*1, 1*0, 1*0.1]
        var color = this.owner.getColor();
        this.buildingSpriteFront.filters = [ color.colorMatrixFilter() ];
        this._recolorBar(color.clone().lighten(0.75));
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
     * @param {BuildingState} current - the current (most) game state, will be this.next if this.current is null
     * @param {BuildingState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next, reason, nextReason) {
        GameObject._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update the Building based on its current and next states

        // if this building shoots beams (is not a WeatherStation)
        if(this.beamSprite) {
            // assume it's not shooting a beam for this state
            this.beamSprite.visible = false;
            // but check if it is
            if(nextReason && nextReason.run && nextReason.run.caller === this && nextReason.returned > -1) {
                // and if it is the Building running a verb, show the beam shooting towards a target building
                this.beamSprite.visible = true;
                var building = nextReason.run.args.building || nextReason.run.args.warehouse;
                this.renderer.renderSpriteBetween(this.beamSprite, current, building.current);
            }
        }
        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add to this class can be perserved here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = Building;
