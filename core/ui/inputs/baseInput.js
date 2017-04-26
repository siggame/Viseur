var $ = require("jquery");
var Classe = require("classe");
var Observable = require("core/observable"); // all inputs are observable... you input stuff in them after all
var BaseElement = require("../baseElement");
var Field = require("./field");

/**
 * @class BaseInput - The base class all input elements inherit from, basically an interface
 */
var BaseInput = Classe(BaseElement, Observable, {
    init: function(args) {
        BaseElement.init.call(this, args);
        Observable.init.call(this);

        if(args.label) {
            this.field = new Field({
                id: this.id,
                label: args.label,
                hint: args.hint,
                input: this,
                $parent: this.$parent,
            });
        }

        if(args.disabled) {
            this.disable();
        }

        var self = this;
        this.$element.on("change input", function() {
            self.setValue(self._getElementValue());
            self._emit("changed", self._value);
        });

        this.setValue(args.value);
    },

    /**
     * Handlebars template that builds the element
     * @private
     * @type {function}
     */
    _template: require("./baseInput.hbs"),

    /**
     * Gets the value of this BaseInput
     *
     * @returns {*} The value of the input, depends on subclass
     */
    getValue: function() {
        return this._value;
    },

    /**
     * Sets the value of this BaseInput
     *
     * @param {*} newValue - the new value to set to
     */
    setValue: function(newValue) {
        if(this._value !== newValue) {
            this._value = newValue;

            this._updateElementValue();
        }
    },


    /**
     * Disables this input
     */
    disable: function() {
        this.$element.prop("disabled", true);
    },

    /**
     * Enables this input
     */
    enable: function() {
        this.$element.prop("disabled", false);
    },

    /**
     * Gets the value of the DOM element
     *
     * @protected
     * @returns {*} - the DOM element's current value
     */
    _getElementValue: function() {
        return this.$element.val();
    },

    /**
     * updates the value of the DOM element
     *
     * @protected
     */
    _updateElementValue: function() {
        this.$element.val(this._value);
    },
});

module.exports = BaseInput;
