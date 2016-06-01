require("./settingsTab.scss");

var $ = require("jquery");
var Classe = require("classe");
var BaseElement = require("core/ui/baseElement");
var inputs = require("core/ui/inputs/");
var coreSettings = require("../settings");
var Viseur = require("../viseur");
var SettingsManager = require("../settingsManager");

/**
 * @class SettingsTab - The "Help" tab on the InfoPane, displaying settings (both for the core and by game)
 */
var SettingsTab = Classe(BaseElement, {
    init: function(args) {
        BaseElement.init.apply(this, arguments);

        this.$coreSettings = this.$element.find(".core-settings");

        this._initSettings("viseur", coreSettings, this.$coreSettings);

        this.$gameSettings = this.$element.find(".game-settings")
            .addClass("collapsed");

        this.$gameName = this.$gameSettings.find(".game-name");

        var self = this;
        Viseur.on("ready", function(game) {
            self.$gameName.html(game.name);
            self.$gameSettings.removeClass("collapsed");

            self._initSettings(game.name, game.namespace.settings, self.$gameSettings);
        });
    },

    _template: require("./settingsTab.hbs"),

    _initSettings: function(namespace, settings, $parent) {
        if(settings.length === 0) {
            $parent.append($("<span>")
                .addClass("no-settings")
                .html("None")
            );

            return;
        }

        for(var i = 0; i < settings.length; i++) {
            var setting = $.extend({
                $parent: $parent,
            }, settings[i]);

            var inputClass = inputs[setting.input];

            var input = new inputClass(setting);

            if(setting.onInputCreated) {
                setting.onInputCreated(input);
            }

            input.setValue(SettingsManager.get(namespace, setting.id));

            this._setupInput(input, namespace, setting.id);
        }
    },

    _setupInput: function(input, namespace, id) {
        input.on("changed", function(newValue) {
            SettingsManager.set(namespace, id, newValue);
        });
    },
});

module.exports = SettingsTab;
