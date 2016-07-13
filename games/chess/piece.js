var PIXI = require("pixi.js");
var Classe = require("classe");
var BaseGameObject = require("viseur/game/baseGameObject");
var ease = require("core/utils").ease;

var Piece = Classe(BaseGameObject, {
    init: function(initialState, game) {
        BaseGameObject.init.apply(this, arguments);

        var color = initialState.owner.id === "0" ? "white" : "black";
        var type = initialState.type.toLowerCase();

        this._initContainer(this.game.boardContainer);

        this._sprite = this.renderer.newSprite(color + "-" + type, this.container);
    },

    name: "Piece",
    _bottomOffset: 0.125,

    render: function(dt) {
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

        return BaseGameObject.render.call(this, dt);
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
