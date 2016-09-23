// This is a "class" to represent the Game object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var BaseGame = require("viseur/game/baseGame");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

var Chess = require("chess.js");

//<<-- /Creer-Merge: requires -->>

/**
 * @class
 * @classdesc The traditional 8x8 chess board with pieces.
 * @extends BaseGame
 */
var Game = Classe(BaseGame, {
    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "Chess",

    // The following values should get overridden when delta states are merged, but we set them here as a reference for you to see what variables this class has.

    /**
     * If this game supports human playable clients
     *
     * @static
     * @type {boolean}
     */
    //<<-- Creer-Merge: humanPlayable -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    humanPlayable: true,
    //<<-- /Creer-Merge: humanPlayable -->>

    /**
     * Called when Viseur is ready and wants to start rendering the game. This is really where you should init stuff
     *
     * @private
     */
    _start: function() {
        BaseGame._start.call(this);

        //<<-- Creer-Merge: _start -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var length = 8 + this._borderLength*2;
        this.renderer.setSize(length, length);

        this._highlighedLocations = [];

        var self = this;
        this.onSettingChanged("flip-board", function(flipBoard) {
            self._flipBackground(flipBoard);
        });

        //<<-- /Creer-Merge: _start -->>
    },

    /**
     * initializes the background. It is drawn once automatically after this step.
     *
     * @private
     */
    _initBackground: function() {
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
                var tile = this.renderer.newSprite(((x+y)%2 ? "white" : "black") + "-tile", this._tileContainer);

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
     */
    _renderBackground: function(dt) {
        BaseGame._renderBackground.call(this);

        //<<-- Creer-Merge: _renderBackground -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update and re-render whatever you initialize in _initBackground
        //<<-- /Creer-Merge: _renderBackground -->>
    },

    /**
     * Invoked when the state updates.
     *
     * @private
     */
    _stateUpdated: function() {
        BaseGame._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        this._chessUpdated = false;
        this._unhighlightLocations();

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

                if(i == 1) { // bottom
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
            this._chess.load(this.current.fen);

            this._validMoves = this._chess.moves({ verbose: true });
        }
    },

    /**
     * Highlights the tiles that are valid moves for a piece by id
     *
     * @param {string} pieceID - id of the piece to find valid moves for
     */
    showValidMovesFor: function(pieceID) {
        this._updateChess();

        this._unhighlightLocations();

        var moves = this._validMoves;
        var piece = this.current.gameObjects[pieceID];
        var from = piece.file + piece.rank;
        var fromPos = this._getXY(from);

        this._fromSprite.x = fromPos.x;
        this._fromSprite.y = fromPos.y;
        this._fromSprite.visible = true;

        if(this.next) {
            var nextPiece = this.next.gameObjects[pieceID];
            var toPos = this._getXY(nextPiece.file + nextPiece.rank);

            this._toSprite.x = toPos.x;
            this._toSprite.y = toPos.y;
            this._toSprite.visible = true;
        }

        for(var i = 0; i < moves.length; i++) {
            var move = moves[i];

            if(move.from === from) {
                var pos = this._getXY(move.to);

                this._tileSprites[pos.x][pos.y].filters = [ this._randomColorComplimentFilter ];
                this._highlighedLocations.push(pos);
            }
        }
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
     * Invoked when a tile is clicked
     *
     * @private
     * @param {number} x - x coordinate
     * @param {number} y - y coordinate
     */
    _tileClicked: function(x, y) {
        this._unhighlightLocations();
    },

    /**
     * Returns tiles to "normal" look if highlighed for movement lookup
     *
     * @private
     */
    _unhighlightLocations: function() {
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
    },

    //<<-- /Creer-Merge: functions -->>

});

module.exports = Game;
