var PIXI = require("pixi.js");

PIXI.utils.skipHello();

/**
 * Convience function. Takes the DisplayObject's current scale into account when setting the pivot, so you don't have to have pixel values
 * @param {number} relativeX - a scalar based on the currently scaled width, so 0.5 is the center
 * @param {number} relativeY - a scalar based on the currently scaled height, so 0.5 is the middle
 */
PIXI.DisplayObject.prototype.setRelativePivot = function setRelativePivot(relativeX, relativeY) {
    this.pivot.set(relativeX * this.width/this.scale.x, relativeY * this.height/this.scale.y);
};
