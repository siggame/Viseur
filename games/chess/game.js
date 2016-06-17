var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var BaseGame = require("viseur/game/baseGame");

var Game = Classe(BaseGame, {
    init: function() {
        BaseGame.init.apply(this, arguments);

        this._randomColor = Color().hsl(this.random() * 360, 60, 40).whiten(1.5);

        this._backgroundColor = this._randomColor.clone().darken(0.75);
        this._whiteColor = this._randomColor;
        this._whiteTopColor = this._randomColor.clone().lighten(0.15);
        this._blackColor = this._randomColor.clone().darken(0.5);
        this._blackTopColor = this._blackColor.clone().lighten(0.15);
    },

    name: "Chess",
    _textColor: Color().rgb(222, 222, 222),
    _tileBorderLength: 0.9,
    _borderLength: 0.5,

    _start: function() {
        BaseGame._start.call(this);

        var length = 8 + this._borderLength*2;
        this.renderer.setSize(length, length);
    },

    _renderBackground: function() {
        var layer = this.layers.background;
        // render the background, which displays the file/rank
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

        this._boardGraphics = new PIXI.Graphics();
        this._boardGraphics.setParent(this.boardContainer);

        var textOptions = { height: this._borderLength/2, fill: this._textColor };
        var x = 0;
        var y = 0;
        var tileBorderOffset = (1-this._tileBorderLength)/2;
        for(var i = 0; i < 2; i++) {
            // vertical ranks
            for(y = 1; y <= 8; y++) {
                var rankText = this.renderer.newPixiText(String(y), layer, textOptions);
                rankText.anchor.set(0.5);
                rankText.y = 9 - y;
                rankText.x = this._borderLength/2;
                if(i === 1) { // bottom
                    rankText.x += 8 + this._borderLength;
                }
            }

            // horizontal files
            for(x = 1; x <= 8; x++) {
                var fileText = this.renderer.newPixiText(String.fromCharCode("a".charCodeAt(0) + x - 1), layer, textOptions);
                fileText.anchor.set(0.5);
                fileText.x = x;
                fileText.y = this._borderLength/2;
                if(i == 1) { // bottom
                    fileText.y += 8 + this._borderLength;
                }
            }
        }

        for(x = 0; x < 8; x++) {
            for(y = 0; y < 8; y++) {
                var color = ((x+y) % 2 === 0 ? this._whiteColor : this._blackColor);
                this._boardGraphics.beginFill(color.hexNumber(), 1);
                this._boardGraphics.drawRect(x, y, 1, 1);
                this._boardGraphics.endFill();

                color = ((x+y) % 2 === 0 ? this._whiteTopColor : this._blackTopColor);
                this._boardGraphics.beginFill(color.hexNumber(), 1);
                this._boardGraphics.drawRoundedRect(x + tileBorderOffset, y + tileBorderOffset, this._tileBorderLength, this._tileBorderLength, 0.125);
                this._boardGraphics.endFill();
            }
        }
    },
});

module.exports = Game;
