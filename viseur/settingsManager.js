var Classe = require("classe");
var defaultSettings = require("./defaultSettings.json");

var SettingsManager = Classe({
    init: function() {
        this._settings = {};

        for(var key in defaultSettings) {
            if(defaultSettings.hasOwnProperty(key)) {
                this.set(key, defaultSettings[key]);
            }
        }
    },

    get: function(key, def) {
        if(this._settings.hasOwnProperty(key)) {
            return this._settings[key];
        }

        return def;
    },

    set: function(key, value) {
        this._settings[key] = value;
    }
});

module.exports = new SettingsManager; // singleton
