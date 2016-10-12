/**
 * creates sinusoidal movement easing (back and forth movement) between min + max and min - max
 *
 * @param {number} min - minimum bound
 * @param {number} max - max positive bound
 * @param {number} dt - percentage of progress in between 0->1
 * @param {number} curves - number of curves to have the sinusoidal ease make between 0 and 1 for dt.
 * @returns {number} a value between min + max and min - max following sinusoidal movement having dt progress
 */
function sineEase(min, max, dt, curves) {
    var diff = max - min;
    var sinuized = Math.sin(dt * (Math.PI * curves));
    return min + (diff * sinuized);
}

// given an x, y and theta, returns the rotated matrix counter clock wise according to wiki formula.
/**
 * given an x, y and theta, finds the rotated matrix
 * @param {number} x - first vector element
 * @param {number} y - econd vector element
 * @param {number} theta - rotation in radians
 * @param {boolean} clockwise - whether to perform clockwise or counter clockwise rotation
 * @returns {Array.<number>} array of two vector elements that are rotated by theta
 */
function rotate2D(x, y, theta, clockwise) {
    if(typeof clockwise !== "undefined") {
        clockwise = false;
    }
    var angleCos = Math.cos(theta);
    var angleSin = Math.sin(theta);
    var newX;
    var newY;
    // rotate clockwise by theta
    if(clockwise) {
        newX = x * angleCos + y * angleSin;
        newY = (-1 * x * angleSin) + y * angleCos;
    }
    // rotate counter clockwise by theta
    else {
        newX = x * angleCos - y * angleSin;
        newY = x * angleSin + y * angleCos;
    }
    // return array of new x and y values
    return [newX, newY];
}

module.exports.sineEase = sineEase;
module.exports.rotate2D = rotate2D;
