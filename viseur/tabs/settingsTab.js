require("./settingsTab.scss");

var $ = require("jquery");
var Classe = require("classe");
var BaseElement = require("core/ui/baseElement");
var inputs = require("core/ui/inputs/");

/**
 * @class SettingsTab - The "Help" tab on the InfoPane, displaying settings (both for the core and by game)
 */
var SettingsTab = Classe(BaseElement, {
    init: function(args) {
        BaseElement.init.apply(this, arguments);

        this.$coreSettings = $(".core-settings", this.$element);

        this.resolutionInput = new inputs.DropDown({
            id: "resolution-type",
            label: "Resolution",
            hint: "'Auto' will resize to the current window's resolution.\n'Manual' can be used to set to a lower resolution for slower computers.",
            $parent: this.$coreSettings,
            options: [ "Auto", "Manual" ],
        });

        this.resolutionWidth = new inputs.Number({
            id: "resolution-width",
            label: "Width",
            $parent: this.$coreSettings,
            min: 400,
        });

        this.resolutionHeight = new inputs.Number({
            id: "resolution-height",
            label: "Height",
            $parent: this.$coreSettings,
            min: 300,
        });

        this.antialiasingInput = new inputs.CheckBox({
            id: "anti-aliasing",
            label: "Anti-Aliasing",
            $parent: this.$coreSettings,
            value: true,
        });

        var self = this;
        this.resolutionInput.on("changed", function(newValue) {
            self._onResolutionInputChanged(newValue);
        });

        this.resolutionInput.setValue("Auto");
        this._onResolutionInputChanged("Auto");

        this.$gameSettings = $(".game-settings", this.$element)
            .addClass("collapsed");
    },

    _template: require("./settingsTab.hbs"),

    _onResolutionInputChanged: function(newValue) {
        this.resolutionWidth.field.$element.toggleClass("collapsed", newValue !== "Manual");
        this.resolutionHeight.field.$element.toggleClass("collapsed", newValue !== "Manual");
    },
});

module.exports = SettingsTab;
