var store = require("store");
var Classe = require("classe");
var Observable = require("core/observable");

var SettingsManager = Classe(Observable, {
    get: function(namespace, key, def) {
        var id = this._getID(namespace, key);

        if(!store.has(id)) {
            this.set(namespace, key, def);
            return def;
        }

        return store.get(id);
    },

    set: function(namespace, key, value) {
        var id = this._getID(namespace, key);

        store.set(id, value);

        this._emit(id + ".changed".format(namespace, key), value);
    },

    _getID: function(/* ... */) {
        return Array.prototype.join.call(arguments, ".");
    }
});

module.exports = new SettingsManager(); // singleton
