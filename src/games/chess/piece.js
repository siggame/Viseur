// This is a "class" to represent the Piece object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("src/core/utils").ease;

var GameObject = require("./gameObject");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs
//<<-- /Creer-Merge: requires -->>

/**
 * @typedef {Object} PieceState - A state representing a Piece
 * @property {boolean} captured - When the Piece has been captured (removed from the board) this is true. Otherwise false.
 * @property {string} file - The file (column) coordinate of the Piece represented as a letter [a-h], with 'a' starting at the left of the board.
 * @property {string} gameObjectName - String representing the top level Class that this game object is an instance of. Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
 * @property {boolean} hasMoved - If the Piece has moved from its starting position.
 * @property {string} id - A unique id for each instance of a GameObject or a sub class. Used for client and server communication. Should never change value after being set.
 * @property {Array.<string>} logs - Any strings logged will be stored here. Intended for debugging.
 * @property {PlayerState} owner - The player that controls this chess Piece.
 * @property {number} rank - The rank (row) coordinate of the Piece represented as a number [1-8], with 1 starting at the bottom of the board.
 * @property {string} type - The type of chess Piece this is, either 'King, 'Queen', 'Knight', 'Rook', 'Bishop', or 'Pawn'.
 */

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
     * @param {PieceState} initialState - the initial state of this game object
     * @param {Game} game - the game this Piece is in
     */
    init: function(initialState, game) {
        GameObject.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this.owner = this.game.gameObjects[initialState.owner.id];
        this._initialType = initialState.type;

        this._initContainer(this.game.boardContainer);

        this._spriteInitial = this._generateSprite(initialState);
        this._spritePromoted = null; // used if the pawn is promoted

        //<<-- /Creer-Merge: init -->>
    },

    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "Piece",

    /**
     * The current state of this Piece. Undefined when there is no current state.
     *
     * @type {PieceState|null})}
     */
    current: null,

    /**
     * The next state of this Piece. Undefined when there is no next state.
     *
     * @type {PieceState|null})}
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
     * Called approx 60 times a second to update and render the Piece. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {PieceState} current - the current (most) game state, will be this.next if this.current is null
     * @param {PieceState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    render: function(dt, current, next, reason, nextReason) {
        GameObject.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if(current.captured) { // then we don't exist to be rendered
            this.container.visible = false;
            return; // no need to figure out where to render, as it's now invisible
        }
        // else, we are visible and need to be rendered on the screen somewhere
        this.container.visible = true;

        var currentPosition = this._transformFileRank(current.file, current.rank);
        var nextPosition = this._transformFileRank(next.file, next.rank);

        if(!current.captured && next.captured) { // then we got captured :(
            nextPosition = currentPosition; // as next nextPosition would be off map
            this.container.alpha = ease(1 - dt, "cubicInOut"); // fade it out
        }
        else {
            this.container.alpha = 1; // fulls visible, as they are not captured
        }

        // now actually move us on screen
        this.container.x = ease(currentPosition.x, nextPosition.x, dt, "cubicInOut");
        this.container.y = ease(currentPosition.y, nextPosition.y, dt, "cubicInOut");

        if(this.game.getSetting("flip-board")) { // then we need to flip our vertical position
            this.container.y = 7 - this.container.y; // flip it so the y is inverted (board height is 8, so 7 because we index at 0)
        }

        this.container.y -= this._bottomOffset; // push it up a bit to look better

        //<<-- /Creer-Merge: render -->>
    },

    /**
     * Invoked after init or when a player changes their color, so we have a chance to recolor this GameObject's sprites
     */
    recolor: function() {
        GameObject.recolor.apply(this, arguments);

        //<<-- Creer-Merge: recolor -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var color = this.owner.getColor();
        var ownerState = this.owner.current || this.owner.next;
        if(ownerState.color.toLowerCase() === "white" && color.hexString() === "#FFFFFF") {
            color = Color("#D1D2D4");
        }
        else if(ownerState.color.toLowerCase() === "black" && color.hexString() === "#000000") {
            color = Color("#58585A");
        }

        var initialSpriteTop = this._spriteInitial.getChildAt(1);
        initialSpriteTop.filters = [ color.colorMatrixFilter() ];

        if(this._spritePromoted) {
            this._spritePromoted.getChildAt(1).filters = initialSpriteTop.filters;
        }

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

        var state = this.current || this.next;
        if(this.game.humanPlayer && this.game.selectedPiece && state && state.file && state.rank) {
            var pos = state.file + state.rank;
            menu.push({
                text: "Move here (pos)".format(pos),
                icon: "map-marker",
                callback: function() {
                    self.game.humanPlayer.handleTileClicked(pos);
                },
            });
        }

        menu.push({
            text: "Show valid moves",
            icon: "eye",
            callback: function() {
                self.game.showValidMovesFor(self.id);
            },
        });

        //<<-- /Creer-Merge: _getContextMenu -->>

        return menu;
    },


    // Joueur functions - functions invoked for human playable client

    /**
     * Moves the Piece from its current location to the given rank and file.
     *
     * @param {string} file - The file coordinate to move to. Must be [a-h].
     * @param {number} rank - The rank coordinate to move to. Must be [1-8].
     * @param {string} [promotionType] - If this is a Pawn moving to the end of the board then this parameter is what to promote it to. When used must be 'Queen', 'Knight', 'Rook', or 'Bishop'.
     * @param {Function} [callback] - callback that is passed back the return value of MoveState once ran on the server
     */
    move: function(file, rank, promotionType, callback) {
        if(arguments.length <= 2) {
            promotionType = "";
        }

        this._runOnServer("move", {
            file: file,
            rank: rank,
            promotionType: promotionType,
        }, callback);
    },

    // /Joueur functions

    /**
     * Invoked when the state updates.
     *
     * @private
     * @param {PieceState} current - the current (most) game state, will be this.next if this.current is null
     * @param {PieceState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next, reason, nextReason) {
        GameObject._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        if(!this._spritePromoted && this._initialType !== (this.next || this.current).type) { // check to see if we need to find the promoted sprite
            // then we've been promoted
            this._spritePromoted = this._generateSprite(this.next || this.current);
            this.recolor();
        }
        else if(this._spritePromoted) { // need to display the correct sprite if at this state is has or has not been promoted
            var isPawn = (current.type.toLowerCase() === "pawn");

            this._spriteInitial.visible = isPawn;
            this._spritePromoted.visible = !isPawn;
        }

        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    /**
     * An offset from the bottom of it's tile to look better
     *
     * @static
     * @type {number}
     */
    _bottomOffset: 0.125,

    /**
     * Generates the sprite key for the chess piece
     *
     * @param {PieceState} [state] - state override, otherwise will use the current or next state
     * @returns {PIXI.DisplayObject} the sprite or container for the given state
     */
    _generateSprite: function(state) {
        state = state || this.current || this.next;

        var type = state.type.toLowerCase();
        var container = new PIXI.Container();
        container.setParent(this.container);
        var back = this.renderer.newSprite("piece_" + type + "_bottom", container);

        var ownersChessColor = state.owner.color.toLowerCase();
        back.filters = [ Color(ownersChessColor).colorMatrixFilter() ];

        this.renderer.newSprite("piece_" + type + "_top", container);
        // still needs to be recolored

        return container;
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
