var Classe = require("classe");
var PIXI = require("pixi.js");
var ease = require("core/utils").ease;
var sineEase = require("games/saloon/extraEases.js").sineEase;
var rotate2D = require("games/saloon/extraEases.js").rotate2D;

/**
 * @class
 * @classdesc particle bubble which is used to display upward sinusoidal movement upward of a circular body
 */
var ParticleBubble = Classe({
    /**
     * initializes variables for particle bubble
     * @param {Object.<PIXI.Circle>} startShape - starting shape for particle bubble
     * @param {Object.<PIXI.Circle>} endShape - ending shape for particle bubble
     * @param {number} startDelta - starting delta for particle bubble
     * @param {Object.<Game>} game - game object
     */
    init: function(startShape, endShape, startDelta, game) {
        // starting shape of bubble
        this.startShape = startShape;
        // ending shape state of bubble
        this.endShape = endShape;
        // starting delta
        this.startDelta = startDelta;
        // game object to get random() with deterministic seed
        this.game = game;
        // getting a value between 0-> PI/2
        // rotating the direction of the upward facing bubbles from PI/2 to between PI3/4 and PI/4
        this.direction = ((game.random() * (Math.PI / 2)) - (Math.PI / 4));
    },

    /**
     * returns the shape of the particle bubble according to the specified delta dt and number of curves
     * for the sinusoidal function
     * @param {number} dt - currently pulled delta for frame
     * @param {number} curves - number of curves for sinusoidal function
     * @returns {Object.<PIXI.Circle>} shape state for the particle bubble
     */
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
