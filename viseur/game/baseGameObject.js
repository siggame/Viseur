var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var Observable = require("core/observable");

var BaseGameObject = Classe(Observable, {
    init: function(initialState, game) {
        Observable.init.call(this);
        this.id = initialState.id;
        this.gameObjectName = initialState.gameObjectName;

        this.game = game;
        this.renderer = game.renderer;
    },

    update: function(current, next) {
        this.current = current;
        this.next = next;
    },

    _initContainer: function(parent) {
        var self = this;
        var onClick = function() {
            self._clicked();
        };

        this.container = new PIXI.Container();

        if(parent) {
            this.container.setParent(parent);
        }

        this.container.interactive = true;

        this.container.on("mouseupoutside", onClick);
        this.container.on("mousedown", onClick);
        this.container.on("touchend", onClick);
        this.container.on("touchendoutside", onClick);

        return this.container;
    },

    _clicked: function() {
        this._emit("clicked");
    },

    highlight: function() {
        this._highlighting = true;
        this._highlightAlpha = this._highlightAlpha || 0;
    },

    unhighlight: function() {
        this._highlighting = false;
    },

    render: function() {
        if(this._highlightAlpha !== undefined) {
            if(!this._uxGraphics) {
                this._initGraphicsForUX();
            }

            if(this._highlightAlpha < 1 && this._highlighting) {
                this._highlightAlpha = Math.min(this._highlightAlpha + 0.05, 1);
            }
            else {
                this._highlightAlpha = Math.max(this._highlightAlpha - 0.05, 0);
            }

            if(this._highlightAlpha >= 1) {
                this.unhighlight();
            }

            this._uxGraphics.clear();
            this._uxGraphics.beginFill(this._uxHighlightColor.hexNumber(), 0); // transparent
            this._uxGraphics.lineStyle(0.1, this._uxHighlightColor.hexNumber(), this._highlightAlpha);

            this._uxGraphics.drawRoundedRect(0, 0, this.container.width, this.container.height, 0.1);
            this._uxGraphics.endFill();
        }
    },

    _uxHighlightColor: Color().rgb(255, 251, 204),

    _initGraphicsForUX: function() {
        this._uxGraphics = new PIXI.Graphics();
        this._uxGraphics.setParent(this.container);
    },
});

module.exports = BaseGameObject;
