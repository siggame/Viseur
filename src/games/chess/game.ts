// This is a class to represent the Game object in the game. If you want to render it in the game do so here.
import * as Color from "color";
import * as PIXI from "pixi.js";
import * as utils from "src/utils";

import { BaseGame } from "src/viseur/game/base-game";
import { IBaseGameState } from "src/viseur/game/interfaces";

// <<-- Creer-Merge: imports -->>

const Chess = require("chess.js");

// <<-- /Creer-Merge: imports -->>

 /** A state representing a Game */
interface IGameState extends IBaseGameState {
    /** The player whose turn it is currently. That player can send commands. Other players cannot. */
    currentPlayer: IPlayerState;

    /** The current turn number, starting at 0 for the first player's turn. */
    currentTurn: number;

    /** Forsyth–Edwards Notation, a notation that describes the game board. */
    fen: string;

    /** A mapping of every game object's ID to the actual game object. Primarily used by the server and client to easily refer to the game objects via ID. */
    gameObjects: {[id: string]: IGameObjectState};

    /** The maximum number of turns before the game will automatically end. */
    maxTurns: number;

    /** The list of Moves that have occurred, in order. */
    moves: IMoveState[];

    /** All the uncaptured Pieces in the game. */
    pieces: IPieceState[]

    /** List of all the players in the game. */
    players: IPlayerState[];

    /** How many turns until the game ends because no pawn has moved and no Piece has been taken. */
    turnsToDraw: number;
}

/**
 * The traditional 8x8 chess board with pieces.
 */
export class Game extends BaseGame {
    /**
     * The static name of this game.
     */
    public static readonly gameName: string = "Base Game";

    /** The number of players in this game. the players array should be this same size */
    public readonly numberOfPlayers: number = 2;

    /** The current state of the game (dt = 0) */
    public current: IGameState;

    /** The next state of the game (dt = 1) */
    public next: IGameState;

    // <<-- Creer-Merge: variables -->>

    private textColor = Color().rgb(222, 222, 222);
    private tileBorderLength = 0.9;
    private borderLength = 0.5;
    private highlightedLocations = [];

    // <<-- /Creer-Merge: variables -->>

    /**
     * Called when Viseur is ready and wants to start rendering the game. This is really where you should init stuff
     */
    protected start(): void {
        super.start();

        // <<-- Creer-Merge: start -->>

        const length = 8 + this._borderLength*2;
        this.renderer.setSize(length, length, 0.5, 0.5, 0.5, 0.5);

        this._highlighedLocations = [];

        var self = this;
        this.onSettingChanged("flip-board", function(flipBoard) {
            self._flipBackground(flipBoard);
        });

        // <<-- /Creer-Merge: start -->>
    }

    /**
     * initializes the background. It is drawn once automatically after this step.
     *
     * @private
     * @param {GameState} state - initial state to use the render the background
     */
    _initBackground: function(state) {
        BaseGame._initBackground.call(this);

        //<<-- Creer-Merge: _initBackground -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var self = this;

        this._randomColor = Color().hsl(this.random() * 360, 60, 40).whiten(1.5);
        this._randomColorCompliment = this._randomColor.clone().rotate(180);

        this._randomColorComplimentFilter = new PIXI.filters.ColorMatrixFilter();
        this._randomColorComplimentFilter.matrix = this._randomColorCompliment.colorMatrix();

        this._backgroundColor = this._randomColor.clone().darken(0.75);
        this._whiteColor = this._randomColor;
        this._whiteTopColor = this._randomColor.clone().lighten(0.15);
        this._blackColor = this._randomColor.clone().darken(0.5);
        this._blackTopColor = this._blackColor.clone().lighten(0.15);

        var layer = this.layers.background;

        // the background, which displays the file/rank, and the "tiles"
        var length = 8 + this._borderLength*2;
        layer.addChild(new PIXI.Graphics())
            .beginFill(this._backgroundColor.hexNumber(), 1)
            .drawRect(0, 0, length, length)
            .endFill();

        // render the board
        this.boardContainer = new PIXI.Container();
        this.boardContainer.setParent(this.layers.game);
        this.boardContainer.x = this._borderLength;
        this.boardContainer.y = this._borderLength;

        this._tileContainer = new PIXI.Container();
        this._tileContainer.setParent(this.boardContainer);

        this._overlayContainer = new PIXI.Container();
        this._overlayContainer.setParent(this.boardContainer);

        this._gridStrings = {
            rank: [],
            file: [],
        };

        this._tileBorderOffset = (1 - this._tileBorderLength)/2;
        var textOptions = { height: this._borderLength/2, fill: this._textColor };

        for(var i = 0; i < 2; i++) {
            var ranks = [];
            this._gridStrings.rank[i]= ranks;

            // vertical ranks
            for(var rank = 1; rank <= 8; rank++) {
                var rankText = this.renderer.newPixiText(String(rank), layer, textOptions);
                rankText.anchor.set(0.5);

                ranks[rank] = rankText;
            }

            var files = [];
            this._gridStrings.file[i] = files;

            // horizontal files
            for(var file = 1; file <= 8; file++) {
                var fileText = this.renderer.newPixiText(String.fromCharCode("a".charCodeAt(0) + file - 1), layer, textOptions);
                fileText.anchor.set(0.5);

                files[file] = fileText;
            }
        }

        this._tileSprites = [];
        for(var x = 0; x < 8; x++) {
            this._tileSprites[x] = [];
            for(var y = 0; y < 8; y++) {
                var tile = this.renderer.newSprite("tile_" + ((x+y)%2 ? "white" : "black"), this._tileContainer);

                (function(tile, x, y, self) {
                    var onClick = function() {
                        self._tileClicked(x, y);
                    };

                    tile.interactive = true;
                    tile.on("mouseupoutside", onClick);
                    tile.on("mouseup", onClick);
                    tile.on("touchend", onClick);
                    tile.on("touchendoutside", onClick);
                    tile.on("rightup", onClick);
                    tile.on("rightupoutside", onClick);
                })(tile, x, y, this);

                this._tileSprites[x][y] = tile;
            }
        }

        var filter = new PIXI.filters.ColorMatrixFilter();
        filter.matrix = this._randomColorCompliment.clearer(0.333).colorMatrix();

        this._fromSprite = this.renderer.newSprite("", this._overlayContainer);
        this._fromSprite.visible = false;
        this._fromSprite.filters = [ filter ];

        this._toSprite = this.renderer.newSprite("", this._overlayContainer);
        this._toSprite.visible = false;
        this._toSprite.filters = [ filter ];

        filter = new PIXI.filters.ColorMatrixFilter();
        filter.matrix = this._randomColor.colorMatrix();

        this._tileContainer.filters = [ filter ];

        this._flipBackground(this.getSetting("flip-board"));

        //<<-- /Creer-Merge: _initBackground -->>
    },

    /**
     * Called approx 60 times a second to update and render the background. Leave empty if the background is static
     *
     * @private
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {GameState} current - the current (most) game state, will be this.next if this.current is null
     * @param {GameState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _renderBackground: function(dt, current, next, reason, nextReason) {
        BaseGame._renderBackground.call(this);

        //<<-- Creer-Merge: _renderBackground -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update and re-render whatever you initialize in _initBackground
        //<<-- /Creer-Merge: _renderBackground -->>
    },

    /**
     * Sets the default colors of the player, should be indexed by their place in the Game.players array
     *
     * @param {Array.<Color>} colors - the colors for those players, defaults to red and blue
     */
    _setDefaultPlayersColors: function(colors) {
        //<<-- Creer-Merge: _setDefaultPlayersColors -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        colors[0] = Color("white");
        colors[1] = Color("black");

        //<<-- /Creer-Merge: _setDefaultPlayersColors -->>
    },


    /**
     * Invoked when the state updates.
     *
     * @private
     * @param {GameState} current - the current (most) game state, will be this.next if this.current is null
     * @param {GameState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next, reason, nextReason) {
        BaseGame._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this._chessUpdated = false;
        this._unselect();

        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    _textColor: Color().rgb(222, 222, 222),
    _tileBorderLength: 0.9,
    _borderLength: 0.5,

    /**
     * This is setup above to be called when the `flip-board` setting is changed
     *
     * @param {Boolean} flipBoard - if it is flipped
     */
    _flipBackground: function(flipBoard) {
        this._unselect();

        var x = 0;
        var y = 0;

        for(var i = 0; i < 2; i++) {
            // vertical ranks
            var ranks = this._gridStrings.rank[i];
            for(y = 1; y <= 8; y++) {
                var rankText = ranks[y];

                rankText.y = 9 - y;

                if(flipBoard) {
                    rankText.y = 9 - rankText.y;
                }

                rankText.x = this._borderLength/2;

                if(i === 1) { // bottom
                    rankText.x += 8 + this._borderLength;
                }
            }

            // horizontal files
            var files = this._gridStrings.file[i];
            for(x = 1; x <= 8; x++) {
                var fileText = files[x];

                fileText.x = x;
                fileText.y = this._borderLength/2;

                if(i === 1) { // bottom
                    fileText.y += 8 + this._borderLength;
                }
            }
        }

        for(x = 0; x < 8; x++) {
            for(y = 0; y < 8; y++) {
                var sprite = this._tileSprites[x][y];

                sprite.x = x;
                sprite.y = flipBoard ? 7 - y : y;
            }
        }
    },

    /**
     * Updates chess.js based off the current fen, for move prediction
     *
     * @private
     */
    _updateChess: function() {
        if(!this._chessUpdated) {
            this._chessUpdated = true;

            this._chess = this._chess || new Chess();
            this._chess.load((this.current || this.next).fen);

            this.validMoves = this._chess.moves({ verbose: true });
        }
    },

    /**
     * Highlights the tiles that are valid moves for a piece by id
     *
     * @param {string} pieceID - id of the piece to find valid moves for
     */
    showValidMovesFor: function(pieceID) {
        this._updateChess();

        this._unselect();
        this.selectedPiece = this.gameObjects[pieceID];

        var moves = this.validMoves;
        var piece = this.selectedPiece;
        var pieceState = (piece.current || piece.next);
        var from = pieceState.file + pieceState.rank;
        var fromPos = this._getXY(from);

        this._fromSprite.x = fromPos.x;
        this._fromSprite.y = this._flipY(fromPos.y);
        this._fromSprite.visible = true;

        if(this.next) {
            var nextPiece = this.next.gameObjects[pieceID];
            var toPos = this._getXY(nextPiece.file + nextPiece.rank);

            this._toSprite.x = toPos.x;
            this._toSprite.y = this._flipY(toPos.y);
            this._toSprite.visible = true;
        }

        for(var i = 0; i < moves.length; i++) {
            var move = moves[i];

            if(move.from === from) {
                var pos = this._getXY(move.to);

                // the _tileSprites y position does not need to be changed for flip-board
                this._tileSprites[pos.x][pos.y].filters = [ this._randomColorComplimentFilter ];
                this._highlighedLocations.push(pos);
            }
        }
    },

    /**
     * flips a y coordinate based on the flip board setting
     *
     * @param {number} y - y coordinate to flip
     * @returns {number} y coordinate flipped if needed
     */
    _flipY: function(y) {
        return (this.getSetting("flip-board") ? 7 - y : y);
    },

    /**
     * Transforms a chess coordinate to x,y   E.g. "a1" -> 0,0
     *
     * @private
     * @param {string} chessPosition - a position valid to chess, with file then rank
     * @returns {Object} {x, y}, ranged [0, 7]
     */
    _getXY: function(chessPosition) {
        return {
            x: chessPosition.charCodeAt(0) - "a".charCodeAt(0), // first character ["a", "h"] -> [0, 7]
            y: 7 - (parseInt(chessPosition.charAt(1)) - 1), // second character ["1", "8"] -> [0, 7], 7 - y to flip so that 0 is at the bottom, not top
        };
    },

    /**
     * Transforms an (x, y) coordinate to a chess coordinate   E.g. 0,0 -> "a1"
     * @param {number} x - x coordinate, ranged [0, 7]
     * @param {number} y - y coordinate, ranged [0, 7]
     * @returns {string} a chess coordinate e.g. "a1"
     */
    _getFileRank: function(x, y) {
        return String.fromCharCode("a".charCodeAt(0) + x) + (7 - y + 1);
    },

    /**
     * Invoked when a tile is clicked
     *
     * @private
     * @param {number} x - x coordinate
     * @param {number} y - y coordinate
     */
    _tileClicked: function(x, y) {
        var pos = this._getFileRank(x, y);
        if(this.humanPlayer) {
            this.humanPlayer.handleTileClicked(pos);
        }

        this._unselect();
    },

    /**
     * Returns tiles to "normal" look if highlighed for movement lookup
     *
     * @private
     */
    _unselect: function() {
        if(!this._highlighedLocations) {
            return; // as we have not started yet
        }

        for(var i = 0; i < this._highlighedLocations.length; i++) {
            var loc = this._highlighedLocations[i];

            this._tileSprites[loc.x][loc.y].filters = null;
        }

        this._highlighedLocations.length = 0;

        this._toSprite.visible = false;
        this._fromSprite.visible = false;

        this.selectedPiece = null;
    },

    //<<-- /Creer-Merge: functions -->>

});

module.exports = Game;
