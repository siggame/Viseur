var Color = require("color");

/**
 * An extension that converts the color's hex string to a hex number, e.g. #FFCC00 -> 0xFFCC00 === 16763904
 *
 * @returns {number} the color as a hex number
 */
Color.prototype.hexNumber = function() {
    return parseInt(this.hexString().replace(/^#/, ""), 16); // remove "#", then convert from string to int base 16
};


/**
 * Gets a 4x4 color matrix for ColorMatrixFilter operations. Assumes r at 0,0, g, at 1,1, b at 2,2, and a at 3,3, rest are 0s.
 *
 * @returns {Array.<number>} an array of 16 numbers, representing a 4x4 color matrix of this color
 */
Color.prototype.colorMatrix = function() {
    var r = this.red()/255;
    var g = this.green()/255;
    var b = this.blue()/255;
    var a = this.alpha();

    return [
        r, 0, 0, 0,
        0, g, 0, 0,
        0, 0, b, 0,
        0, 0, 0, a,
    ];
};

/**
 * Gets the most contrasting color (black or white) relative to this color. Useful for text on this color as a background color
 * @returns {Color} either black or white
 */
Color.prototype.contrastingColor = function() {
    return (this.hexNumber() > 0xffffff/2) ?
        Color("black") :
        Color("white");
};
