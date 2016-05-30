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

    _template: require("./baseInput.hbs"),

    /**
     * Gets the value of this BaseInput
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
        this._value = newValue;

        this._updateElementValue();
    },

    disable: function() {
        this.$element.prop("disabled", true);
    },

    enable: function() {
        this.$element.prop("disabled", false);
    },

    _getElementValue: function() {
        return this.$element.val();
    },

    _updateElementValue: function() {
        this.$element.val(this._value);
    },
});

module.exports = BaseInput;
