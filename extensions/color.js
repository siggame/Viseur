var Color = require("color");

/**
 * An extension that converts the color's hex string to a hex number, e.g. #FFCC00 -> 0xFFCC00 === 16763904
 */
Color.prototype.hexNumber = function() {
    return parseInt(this.hexString().replace(/^#/, ''), 16); // remove "#", then convert from string to int base 16
};
