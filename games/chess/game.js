// This is a "class" to represent the Game object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var BaseGame = require("viseur/game/baseGame");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs
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
     * Called when Viseur is ready and wants to start rendering the game. This is really where you should init stuff
     *
     * @private
     */
    _start: function() {
        BaseGame._start.call(this);

        //<<-- Creer-Merge: _start -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

        var length = 8 + this._borderLength*2;
        this.renderer.setSize(length, length);

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

        this._randomColor = Color().hsl(this.random() * 360, 60, 40).whiten(1.5);

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
                this._tileSprites[x][y] = this.renderer.newSprite(((x+y)%2 ? "white" : "black") + "-tile", this._tileContainer);
            }
        }

        var filter = new PIXI.filters.ColorMatrixFilter();
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

    //<<-- /Creer-Merge: functions -->>

});

module.exports = Game;
