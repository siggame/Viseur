// Utils - utility functions used across classes
var eases = require("eases");

module.exports = {
    capitalizeFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    isObject: function(obj) {
        return obj !== null && typeof(obj) === "object";
    },

    /**
     * returns interpolation between two numbers based on some easing function
     *
     * @param {number} a - first number
     * @param {number} b - second number
     * @param {number} [t = 0.5] - scalar [0, 1]
     * @param {string|function} [easing = "linear"] - the name of the easing function in 'eases' module, or a function that acts as a easing function on t
     * @returns {number} linearly interpolated between a and b according to scalar t
     */
    ease:function(a, b, t, easing) {
        if(typeof(b) === "string") {
            easing = b;
            t = a;
            a = 0;
            b = 1;
        }

        easing = easing || "linear";

        if(typeof(easing) === "function") {
            t = easing(t);
        }
        else {
            t = eases[easing].call(eases, t);
        }

       return a * (1 - t) + b * t;
    },
};
