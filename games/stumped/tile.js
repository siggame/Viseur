// This is a "class" to represent the Tile object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

var RESOURCES = ["branches", "food"];

// bit auto-tiling from: // from: https://gamedevelopment.tutsplus.com/tutorials/how-to-use-tile-bitmasking-to-auto-tile-your-level-layouts--cms-25673
var DIRECTIONS = ["North", "South", "East", "West"];
var CORNERS = [["North", "West"], ["North", "East"], ["South", "West"], ["South", "East"]];

var DIRECTION_BITS = {
    NorthWest: 1,
    North: 2,
    NorthEast: 4,
    West: 8,
    East: 16,
    SouthWest: 32,
    South: 64,
    SouthEast: 128,
};

var BIT_TO_INDEX = {
    "2": 1,
    "8": 2,
    "10": 3,
    "11": 4,
    "16": 5,
    "18": 6,
    "22": 7,
    "24": 8,
    "26": 9,
    "27": 10,
    "30": 11,
    "31": 12,
    "64": 13,
    "66": 14,
    "72": 15,
    "74": 16,
    "75": 17,
    "80": 18,
    "82": 19,
    "86": 20,
    "88": 21,
    "90": 22,
    "91": 23,
    "94": 24,
    "95": 25,
    "104": 26,
    "106": 27,
    "107": 28,
    "120": 29,
    "122": 30,
    "123": 31,
    "126": 32,
    "127": 33,
    "208": 34,
    "210": 35,
    "214": 36,
    "216": 37,
    "218": 38,
    "219": 39,
    "222": 40,
    "223": 41,
    "248": 42,
    "250": 43,
    "251": 44,
    "254": 45,
    "255": 46,
    "0": 47,
};

/**
 * Checks if a tile in a direction or two is a land tile for auto-tiling
 * @param {TileState} state - tile we are looking at
 * @param {string} direction - direction from tile
 * @param {string} direction2 - direction from the direction tile
 * @return {Boolean} true if that is a land tile, false otherwise
 */
function isLand(state, direction, direction2) {
    var neighbor = state["tile" + direction];
    if(!neighbor) { // off map, just use our type as the off map type
        neighbor = state;
    }

    if(neighbor.type.toLowerCase() !== "land") {
        return false;
    }

    if(direction2) {
        return isLand(neighbor, direction2);
    }

    return true;
}

//<<-- /Creer-Merge: requires -->>

/**
 * @typedef {Object} TileState - A state representing a Tile
 * @property {BeaverState} beaver - The Beaver on this Tile if present, otherwise null.
 * @property {number} branches - The number of branches dropped on this Tile.
 * @property {string} flowDirection - The cardinal direction water is flowing on this Tile ('North', 'East', 'South', 'West').
 * @property {number} food - The number of food dropped on this Tile.
 * @property {string} gameObjectName - String representing the top level Class that this game object is an instance of. Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
 * @property {string} id - A unique id for each instance of a GameObject or a sub class. Used for client and server communication. Should never change value after being set.
 * @property {PlayerState} lodgeOwner - The owner of the Beaver lodge on this Tile, if present, otherwise null.
 * @property {Array.<string>} logs - Any strings logged will be stored here. Intended for debugging.
 * @property {SpawnerState} spawner - The resource Spawner on this Tile if present, otherwise null.
 * @property {TileState} tileEast - The Tile to the 'East' of this one (x+1, y). Null if out of bounds of the map.
 * @property {TileState} tileNorth - The Tile to the 'North' of this one (x, y-1). Null if out of bounds of the map.
 * @property {TileState} tileSouth - The Tile to the 'South' of this one (x, y+1). Null if out of bounds of the map.
 * @property {TileState} tileWest - The Tile to the 'West' of this one (x-1, y). Null if out of bounds of the map.
 * @property {string} type - What type of Tile this is, either 'Water' or 'Land'.
 * @property {number} x - The x (horizontal) position of this Tile.
 * @property {number} y - The y (vertical) position of this Tile.
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
     * @param {TileState} initialState - the initial state of this game object
     * @param {Game} game - the game this Tile is in
     */
    init: function(initialState, game) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this._initContainer(this.game.layers.background);

        var textureKey = "tile_water";
        if(initialState.type.toLowerCase() === "land") {
            // make it look cool
            var sum = 0;
            for(var i = 0; i < DIRECTIONS.length; i++) {
                var direction = DIRECTIONS[i];

                if(isLand(initialState, direction)) {
                    sum += DIRECTION_BITS[direction];
                }
            }

            for(i = 0; i < CORNERS.length; i++) {
                var corner = CORNERS[i];
                var vert = corner[0];
                var hor = corner[1];

                if(
                    isLand(initialState, vert) &&
                    isLand(initialState, hor) &&
                    isLand(initialState, vert, hor)
                ) {
                    sum += DIRECTION_BITS[vert + hor];
                }
            }

            var byte = BIT_TO_INDEX[sum];
            textureKey = "tileset@" + byte;
        }

        this.sprite = this.renderer.newSprite(textureKey, this.container);

        if(initialState.flowDirection) {
            this.flowSprite = this.renderer.newSprite("tile_flow_direction", this.container);
            this.flowSprite.alpha = 0.333;

            switch(initialState.flowDirection.toLowerCase()) {
                case "east":
                    break; // default direction
                case "south":
                    this.flowSprite.rotation += Math.PI/2;
                    this.flowSprite.x += 1;
                    break;
                case "west":
                    this.flowSprite.rotation += Math.PI;
                    this.flowSprite.x += 1;
                    this.flowSprite.y += 1;
                    break;
                case "north":
                    this.flowSprite.rotation += 3*Math.PI/2;
                    this.flowSprite.y += 1;
                    break;
            }
        }

        this.lodgeBottomSprite = this.renderer.newSprite("lodge_bottom", this.container);
        this.lodgeTopSprite = this.renderer.newSprite("lodge_top", this.container);

        this.branchesSprite = this.renderer.newSprite("tile_branches", this.container);
        this.foodSprite = this.renderer.newSprite("tile_food", this.container);

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
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    render: function(dt, current, next, reason, nextReason) {
        GameObject.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        // render resources
        for(var i = 0; i < RESOURCES.length; i++) {
            var resource = RESOURCES[i];
            var sprite = this[resource + "Sprite"];
            var currentAmount = current[resource];
            var nextAmount = next[resource];

            if(currentAmount === 0 && nextAmount === 0) {
                sprite.visible = false;
            }
            else {
                sprite.visible = true;

                var opacity = 1;
                if(currentAmount === 0) {
                    // fade in as it's going from 0 to N
                    opacity = dt;
                }
                else if(nextAmount === 0) {
                    // fade out as it's going from N to 0
                    opacity = 1 - dt;
                }

                sprite.opacity = ease(opacity, "cubicInOut");
            }
        }

        // render the lodge
        if(!current.lodgeOwner && !next.lodgeOwner) {
            // don't render the lodge, it's never used
            this.lodgeBottomSprite.visible = false;
            this.lodgeTopSprite.visible = false;
        }
        else {
            // the tile has a lodge on it at some point

            this.lodgeBottomSprite.visible = true;
            this.lodgeTopSprite.visible = true;

            // and color the top (flag part) of the lodge sprite based on the player's color
            this.lodgeTopSprite.filters = [ this.game.getColorFor(current.lodgeOwner || next.lodgeOwner).colorMatrixFilter() ];

            var alpha = 1;
            if(!current.lodgeOwner) {
                // then they are creating the lodge on the `next` state
                // so fade in the lodge (fade from 0 to 1)
                alpha = ease(dt, "cubicInOut");
            }
            else if(!next.lodgeOwner) {
                // then they lost the lodge on the `next` state
                // so fade it out (1 to 0)
                alpha = ease(1 - dt, "cubicInOut");
            }

            this.lodgeBottomSprite.alpha = alpha;
            this.lodgeTopSprite.alpha = alpha;
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
     * @param {TileState} current - the current (most) game state, will be this.next if this.current is null
     * @param {TileState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next, reason, nextReason) {
        GameObject._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update the Tile based on its current and next states
        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add to this class can be perserved here
    //<<-- /Creer-Merge: functions -->>

});

module.exports = Tile;
