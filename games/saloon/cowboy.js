// This is a "class" to represent the Cowboy object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs

var DRUNK_HUE = 120;
var DEFAULT_HUE = 0;
var TILE_DIRECTIONS = [ "North", "East", "South", "West" ];

//<<-- /Creer-Merge: requires -->>

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
 * @property {PlayerState} owner - The Player that owns and can control this Cowboy.
 * @property {TileState} tile - The Tile that this Cowboy is located on.
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
     * @param {CowboyState} initialState - the initial state of this game object
     * @param {Game} game - the game this Cowboy is in
     */
    init: function(initialState, game) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.job = initialState.job;

        this._initContainer(this.game.layers.game);

        this.spriteBottom = this.renderer.newSprite("cowboy_" + initialState.job.toLowerCase() + "_bottom", this.container);
        this.spriteTop = this.renderer.newSprite("cowboy_" + initialState.job.toLowerCase() + "_top", this.container);

        var owner = game.gameObjects[initialState.owner.id];
        if(owner.id === "0") { // then they are first player, so flip them
            this.spriteBottom.scale.x *= -1;
            this.spriteBottom.anchor.x += 1;
            this.spriteTop.scale.x *= -1;
            this.spriteTop.anchor.x += 1;
        }

        // color the top of the sprite as the player's color
        this.spriteTop.filters = [ owner.getColor().colorMatrixFilter() ];
        // color the bottom (skin) green when drunk
        this._drunkFilter = Color("white").colorMatrixFilter();
        this.spriteBottom.filters = [ this._drunkFilter ];

        // hit damage animation
        this._hitSprite = this.renderer.newSprite("hit", this.container);
        this._hitSprite.anchor.set(0.5, 0.5);
        this._hitSprite.x = 0.5;
        this._hitSprite.y = 0.5;

        switch(this.job) {
            case "Sharpshooter":
                // create initial shot sprites
                this._shotSprites = [ this.renderer.newSprite("shot_head", this.game.layers.bullets) ];
                this._shotSprites[0].anchor.set(0.5, 0.5);
                this._focusTiles = [];
                this._freeFocusSprites = [];
                this._allFocusSprites = [];
                break;
            case "Brawler":
                this._brawlerAttack = this.renderer.newSprite("brawl-attack", this.game.layers.brawl);
                this._brawlerAttack.anchor.set(0.5, 0.5);
                this._brawlerAttack.visible = false;
                this._brawlerAttack.scale.x *= 2;
                this._brawlerAttack.scale.y *= 2;
                break;
        }

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
     * @param {CowboyState} current - the current (most) game state, will be this.next if this.current is null
     * @param {CowboyState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    render: function(dt, current, next, reason, nextReason) {
        GameObject.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.container.visible = !current.isDead;

        if(current.isDead) {
            return; // no need to render further
        }

        // if we got here we are visible!
        this.container.alpha = 1;

        // display the hit if took damage
        var randomRotation = (current.tile.x + current.tile.y); // random-ish
        if(current.health === next.health) {
            this._hitSprite.visible = false;
        }
        else {
            this._hitSprite.visible = true;
            this._hitSprite.alpha = ease(1 - dt, "cubicInOut"); // fade it out
            this._hitSprite.rotation = randomRotation;
        }

        // if for the next state it died, fade it out
        var nextTile = next.tile;
        if(next.isDead) {
            nextTile = current.tile; // it would normally be null, this way we can render it on it's tile of death
            this.container.alpha = ease(1 - dt, "cubicInOut"); // fade it out
        }

        // if this did not exist at first, fade it in
        if(!this.current) {
            this.container.alpha = ease(dt, "cubicInOut");
        }

        // move the container if we moved
        this.container.x = ease(current.tile.x, nextTile.x, dt, "cubicInOut");
        this.container.y = ease(current.tile.y, nextTile.y, dt, "cubicInOut");

        // if the next frame has drunk
        var drunkHue = 0; // default to not drunk hue
        if(current.isDrunk && !next.isDrunk) { // then we are fading out of drunk-ness
            drunkHue = ease(DEFAULT_HUE, DRUNK_HUE, 1 - dt, "cubicInOut");
        }
        else if(!current.isDrunk && next.isDrunk) { // then we are fading into drunk-ness
            drunkHue = ease(DEFAULT_HUE, DRUNK_HUE, dt, "cubicInOut");
        }
        else if(current.isDrunk && next.isDrunk) { // we are just drunk
            drunkHue = DRUNK_HUE;
        }

        // update the drunk color matrix filter to the hue of how drunk we are
        this._drunkFilter.hue(drunkHue, false);

        // if sharpshooter shooting
        var alpha;
        if(this._shotVisible) { // then fade it in and out
            alpha = ease(1 - dt, "cubicInOut"); // fade it out, it displays instantly as shots as sudden

            for(var s = 0; s < this._shotSprites.length; s++) {
                this._shotSprites[s].alpha = alpha;
            }
        }

        // if brawler is brawling
        if(this._brawlerAttack && this._brawlerAttack.visible) {
            this._brawlerAttack.rotation = randomRotation + 2*Math.PI*dt;
        }

        if(this._focusTiles && this._focusTiles.length > 0) {
            var focusScalar = this.game.getSetting("sharpshooter-focus");
            for(var i = 0; i < this._focusTiles.length; i++) {
                var f = this._focusTiles[i];

                if(focusScalar === 0) {
                    f.sprite.visible = false;
                    continue; // no need to figure out alpha, as it's hidden
                }
                else {
                    f.sprite.visible = true;
                }

                alpha = 1;
                if(f.fade === "in") {
                    alpha = dt;
                }
                else if(f.fade === "out") {
                    alpha = 1 - dt;
                }

                f.sprite.alpha = ease(alpha * focusScalar, "cubicInOut");
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

    /**
     * Does their job's action on a Tile.
     *
     * @param {TileState} tile - The Tile you want this Cowboy to act on.
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
     * @param {TileState} tile - The Tile you want to move this Cowboy to.
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
     * @param {FurnishingState} piano - The Furnishing that is a piano you want to play.
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
     * @param {CowboyState} current - the current (most) game state, will be this.next if this.current is null
     * @param {CowboyState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next, reason, nextReason) {
        GameObject._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        var tile;

        if(nextReason && nextReason.run && nextReason.run.caller === this) {
            var run = nextReason.run;
            switch(this.job) {
                case "Sharpshooter":
                    if(run.functionName === "act" && nextReason.returned === true) { // they successfully shot
                        this.showShot(current.tile, run.args.tile, current.focus);
                    }
                    break;
            }
        }
        else {
            this.visibleShot(false);
        }

        if(this.job === "Brawler") {
            var attacking = Boolean(nextReason && nextReason.order === "runTurn" && nextReason.player.id === next.owner.id);
            this._brawlerAttack.visible = attacking;
            if(attacking) {
                tile = (current.tile || next.tile);
                if(tile) {
                    this._brawlerAttack.x = tile.x + 0.5;
                    this._brawlerAttack.y = tile.y + 0.5;
                }
                else { // invalid order
                    this._brawlerAttack.visible = false;
                }
            }
        }
        else if(this.job === "Sharpshooter") {
            this._focusTiles.length = 0;
            this._reclaimFocusSprites();

            if(current.focus > 0 || next.focus > 0) {
                // then show its focus
                var fade; // no change
                if(current.focus > next.focus) {
                    // fade out
                    fade = "out";
                }
                else if(current.focus < next.focus) {
                    // fade in
                    fade = "in";
                }

                var distance = Math.max(current.focus, next.focus);
                for(var d = 0; d < TILE_DIRECTIONS.length; d++) {
                    var direction = TILE_DIRECTIONS[d];
                    tile = current.tile;

                    if(!tile) {
                        break;
                    }

                    for(var i = 0; i < distance; i++) {
                        tile = tile["tile" + direction];

                        if(!tile || tile.isBalcony) {
                            break; // off map
                        }

                        var thisFade = fade;
                        if(fade === "in") { // fade in the new tile
                            thisFade = i === distance-1 ? "in" : undefined;
                        }

                        var sprite = this._getFocusSprite();

                        sprite.visible = true;
                        sprite.x = tile.x;
                        sprite.y = tile.y;

                        this._focusTiles.push({
                            sprite: sprite,
                            fade: thisFade,
                        });
                    }
                }
            }
        }

        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    _getFocusSprite: function() {
        var sprite = this._freeFocusSprites.pop();
        if(sprite) {
            return sprite;
        }

        var newSprite = this.renderer.newSprite("", this.game.layers.background);
        this._allFocusSprites.push(newSprite);

        newSprite.filters = this.spriteTop.filters; // team's color matrix filter

        return newSprite;
    },

    _reclaimFocusSprites: function() {
        this._freeFocusSprites.length = 0;
        for(var i = 0; i < this._allFocusSprites.length; i++) {
            var sprite = this._allFocusSprites[i];
            sprite.visible = false;
            this._freeFocusSprites.push(sprite);
        }
    },

    visibleShot: function(show) {
        show = Boolean(show);
        this._shotVisible = show;

        if(!this._shotSprites) {
            return;
        }

        // hide all the shots by default
        for(var i = 0; i < this._shotSprites.length; i++) {
            this._shotSprites[i].visible = false;
        }
        // showShot will show the correct one(s)
    },

    showShot: function(from, to, distance) {
        this.visibleShot(true);

        var dx = from.x - to.x;
        var dy = from.y - to.y;
        var rotation = 0;

        if(dx !== 0) { // shot to the West or East
            if(dx > 0) { // East
                dx = 1;
                rotation = Math.PI;
            }
            else { // dx < 0, West
                dx = -1;
            }
        }
        else { // dy !== 0, so shot to the North or South
            if(dy > 0) { // South
                dy = 1;
                rotation = Math.PI * 1.5;
            }
            else { // dy < 0, North
                dy = -1;
                rotation = Math.PI * 0.5;
            }
        }

        var i;
        for(i = 0; i < distance; i++) {
            var sprite = this._shotSprites[i];
            if(!sprite) {
                sprite = this.renderer.newSprite("shot_body", this.game.layers.bullets);
                sprite.anchor.set(0.5);
                this._shotSprites.push(sprite);
            }

            sprite.visible = true;
            sprite.x = from.x + 0.5 + dx*(i+1);
            sprite.y = from.y + 0.5 + dy*(i+1);
            sprite.rotation = rotation;
        }
    },
    //<<-- /Creer-Merge: functions -->>

});

module.exports = Cowboy;
