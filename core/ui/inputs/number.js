var Classe = require("classe");
var BaseInput = require("./baseInput");
var $ = require("jquery");

/**
 * @class Number - a text input for numbers
 */
var NumberInput = Classe(BaseInput, {
    /**
     * Initializes the Number Input
     *
     * @constructor
     * @param {Object} args - initialization args, can have min, max, and step
     */
    init: function(args) {
        args = $.extend({
            type: "number",
            min: 0,
            max: 1,
            step: 1,
            value: isNaN(Number(args.value)) ? args.min || 0 : args.value,
        }, args);

        BaseInput.init.call(this, args);

        this.setMin(args.min);
        this.setMax(args.max);
        this.setStep(args.step);
    },

    /**
     * Sets the value to a new number
     *
     * @override
     */
    setValue: function(newValue) {
        newValue = Math.clamp(newValue, this.min, this.max);

        BaseInput.setValue.apply(this, arguments);

        this.$element.val(this._value);
    },

    /**
     * Sets the min attribute of this input
     *
     * @param {number} min - the minimum value this number input can be
     */
    setMin: function(min) {
        this.min = min;
        this.$element.attr("min", min);

        if(this._val < min) {
            this.setValue(min);
        }
    },

    /**
     * Sets the mmax attribute of this input
     *
     * @param {number} max - the maximum value this number input can be
     */
    setMax: function(max) {
        this.max = max;
        this.$element.attr("max", max);

        if(this._val > max) {
            this.setValue(max);
        }
    },

    /**
     * Sets the step attribute of this input
     *
     * @param {number=} step - how much this number input increases/decreases by for each incremiment.
     */
    setStep: function(step) {
        this.step = step;
        this.$element.attr("step", step);
    },
});

module.exports = NumberInput;
