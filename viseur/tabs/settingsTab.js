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

    /**
     * Initalizes the settings for a game, invoked when Viseur is ready so it has a game created to load settings from
     *
     * @private
     */
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

            input.setValue(SettingsManager.get(namespace, setting.id, setting.default));

            this._setupInput(input, namespace, setting.id);
        }
    },

    /**
     * sets up a new input for a corresponding setting at namespace.id to observer for changes between to two
     *
     * @private
     * @param {BaseInput} input - the input that respendts this setting
     * @param {string} namespace - the first part of the setting's id
     * @param {string} id - the key for the setting
     */
    _setupInput: function(input, namespace, id) {
        input.on("changed", function(newValue) {
            SettingsManager.set(namespace, id, newValue);
        });

        SettingsManager.on("{}.{}.changed".format(namespace, id), function(newValue) {
            input.setValue(newValue);
        });
    },
});

module.exports = SettingsTab;
