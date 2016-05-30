var PIXI = require("pixi.js");
var Classe = require("classe");
var BaseGameObject = require("viseur/game/baseGameObject");
var ease = require("core/utils").ease;

var Piece = Classe(BaseGameObject, {
    init: function(initialState, game) {
        BaseGameObject.init.apply(this, arguments);

        var color = initialState.owner.id === "0" ? "white" : "black";
        var type = initialState.type.toLowerCase();

        this.sprite = this.renderer.newSprite(color + "-" + type, this.game.boardContainer);
    },

    name: "Piece",

    render: function(dt) {
        if((!this.current && !this.next) || (this.current && this.current.captured)) { // then we don't exist to be rendered
            this.sprite.visible = false;
            return;
        }

        this.sprite.visible = true;
        var currentPosition = this.current && this._transformFileRank(this.current.file, this.current.rank);
        var nextPosition = this.next  && this._transformFileRank(this.next.file, this.next.rank);
        var renderPosition = currentPosition || nextPosition;

        if(currentPosition && nextPosition) { // then we need to ease the movement from current to next
            if(this.current && !this.current.captured && this.next && this.next.captured) { // then we got captured :(
                renderPosition = currentPosition;
                this.sprite.alpha = 1 - dt;
            }
            else {
                this.sprite.alpha = 1;
                renderPosition = {
                    x: ease(currentPosition.x, nextPosition.x, dt),
                    y: ease(currentPosition.y, nextPosition.y, dt),
                };
            }
        }

        this.sprite.x = renderPosition.x;
        this.sprite.y = renderPosition.y;
    },

    /**
     * Transforms a (file, rank) coordinate to (x, y), e.g.: 'a1' -> (0, 7).
     *   This assumes that the origin for a chess board is the bottom left at a1, and rendering is done at 0,0 being in the top left.
     */
    _transformFileRank: function(file, rank) {
        return {
            x: file.toLowerCase().charCodeAt(0) - "a".charCodeAt(0),
            y: 8 - rank,
        };
    },
});

module.exports = Piece;
