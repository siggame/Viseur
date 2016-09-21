// This is a "class" to represent the Piece object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs
//<<-- /Creer-Merge: requires -->>

/**
 * @class
 * @classdesc A chess piece.
 * @extends GameObject
 */
var Piece = Classe(GameObject, {
    /**
     * Initializes a Piece with basic logic as provided by the Creer code generator. This is a good place to initialize sprites
     *
     * @memberof Piece
     * @private
     */
    init: function(initialState, game) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this._initialSpriteKey = this._generateSpriteKey(initialState);

        this._initContainer(this.game.boardContainer);

        this._spriteInitial = this.renderer.newSprite(this._initialSpriteKey, this.container);
        this._spritePromoted = null; // used if the pawn is promoted

        //<<-- /Creer-Merge: init -->>
    },

    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "Piece",

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
     * Called approx 60 times a second to update and render the Piece. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     */
    render: function(dt) {
        GameObject.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if((!this.current && !this.next) || (this.current && this.current.captured)) { // then we don't exist to be rendered
            this.container.visible = false;
            return; // no need to figure out where to render, as it's now invisible
        }

        this.container.visible = true;
        var currentPosition = this.current && this._transformFileRank(this.current.file, this.current.rank);
        var nextPosition = this.next  && this._transformFileRank(this.next.file, this.next.rank);
        var renderPosition = currentPosition || nextPosition;

        if(currentPosition && nextPosition) { // then we need to ease the movement from current to next
            if(this.current && !this.current.captured && this.next && this.next.captured) { // then we got captured :(
                renderPosition = currentPosition;
                this.container.alpha = ease(1 - dt, "cubicInOut");
            }
            else {
                this.container.alpha = 1;
                renderPosition = {
                    x: ease(currentPosition.x, nextPosition.x, dt, "cubicInOut"),
                    y: ease(currentPosition.y, nextPosition.y, dt, "cubicInOut"),
                };
            }
        }

        this.container.x = renderPosition.x;
        this.container.y = renderPosition.y;

        if(this.game.getSetting("flip-board")) {
            this.container.y = 7 - this.container.y; // flip it so the y is inverted (board height is 8, so 7 because we index at 0)
        }

        this.container.y -= this._bottomOffset; // push it up a bit to look better

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
            {
                text: "Show valid moves",
                icon: "eye",
                callback: function() {
                    self.game.showValidMovesFor(self.id);
                },
            }
            //<<-- /Creer-Merge: _getContextMenu -->>
        ];
    },

    /**
     * Invoked when the state updates.
     *
     * @private
     */
    _stateUpdated: function() {
        GameObject._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if(!this._spritePromoted) { // check to see if we need to find the promoted sprite
            var spriteKey = this._generateSpriteKey();
            if(this._initialSpriteKey !== spriteKey) { // then we need to make that sprite
                this._spritePromoted = this.renderer.newSprite(spriteKey, this.container);
            }
        }
        else { // need to display the correct sprite if at this state is has or has not been promoted
            var isPawn = (this.current.type.toLowerCase() === "pawn");

            this._spriteInitial.visible = isPawn;
            this._spritePromoted.visible = !isPawn;
        }

        //<<-- /Creer-Merge: _stateUpdated -->>
    },


    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * An offset from the bottom of it's tile to look better
     *
     * @type {number}
     */
    _bottomOffset: 0.125,

    /**
     * Generates the sprite key for the chess piece
     *
     * @param {string} [state] - state override, otherwise will use the current or next state
     * @returns {string} key for a sprite that represents this chess piece
     */
    _generateSpriteKey: function(state) {
        state = state || this.current || this.next;
        var color = state.owner.id === "0" ? "white" : "black";
        var type = state.type.toLowerCase();

        return (color + "-" + type);
    },

    /**
     * Transforms a (file, rank) coordinate to (x, y), e.g.: ('a', 1) -> (0, 7).
     *   This assumes that the origin for a chess board is the bottom left at a1, and rendering is done at 0,0 being in the top left.
     *
     * @param {string} file - the file position
     * @param {number} rank - the rank position
     * @returns {Object} and object with an x, y coordinate between [0, 7] for both
     */
    _transformFileRank: function(file, rank) {
        return {
            x: file.toLowerCase().charCodeAt(0) - "a".charCodeAt(0),
            y: 8 - rank,
        };
    },

    /**
     * Shows all the valid move positions on the board for this Piece
     */
    _showValidMoves: function() {
        this.game.showValidMoves();
    },

    //<<-- /Creer-Merge: functions -->>

});

module.exports = Piece;
