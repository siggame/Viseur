var Classe = require("classe");
var PIXI = require("pixi.js");
var ease = require("core/utils").ease;
var sineEase = require("games/saloon/extraEases.js").sineEase;
var rotate2D = require("games/saloon/extraEases.js").rotate2D;

// particle bubble which is used to display upward sinusoidal movement upward of a circular body
var ParticleBubble = Classe({
    // x = x offset from container x
    // y = y offset from container y
    // radius = radius of bubble
    // start_time = initial dt time of bubble (between 0 -> 1)
    // game = game object used to get deterministicly seeded random() function
    // container = PIXI container object for which this object is rendered.
    // max_x max difference value of x in non rotated coordinates
    // max_y max difference value for y in non rotated coordinates
    // max_r = max radius that the bubble will transition to.
    init: function(startShape, endShape, startDelta, game) {
        this.startShape = startShape;
        this.endShape = endShape;
        this.startDelta = startDelta;
        this.game = game;
        // getting a value between 0-> PI/2
        // rotating the direction of the upward facing bubbles from PI/2 to between PI3/4 and PI/4
        this.direction = ((game.random() * (Math.PI / 2)) - (Math.PI / 4));// ((game.random() * (Math.PI / 2)) - (Math.PI / 4)) + Math.PI;
    },

    getShape: function(dt, curves) {
        // normalizing difference between start and current dt, between start -> 1
        if(dt < this.startDelta) {
            dt = this.startDelta;
        }
        var delta = (dt - this.startDelta) / (1 - this.startDelta);
        // creating sinusoidal movement easing for non rotated y
        var easeX = sineEase(this.startShape.x, this.endShape.x, delta, curves);
        // creating linear easing in the non rotated x direction
        var easeY = ease(this.startShape.y, this.endShape.y, delta);
        // rotating x and y vectors to the disired direction
        var easeXY = rotate2D(easeX, easeY, this.direction, true);
        // setting these values to current x and y values.
        var x = easeXY[0];
        var y = easeXY[1];
        // creating linear easing with bubble size.
        var radius = ease(this.startShape.radius, this.endShape.radius, delta);
        return new PIXI.Circle(x, y, radius);
    },
});

module.exports = ParticleBubble;
