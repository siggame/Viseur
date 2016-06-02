var Classe = require("classe");
var Observable = require("core/observable");
var keycodes = require("core/keycodes");

var KeyObserver = Classe(Observable, {
    init: function() {
        Observable.init.call(this);

        var self = this;
        document.addEventListener("keydown", function(e) {
            self._emitKey(e, "down");
        });

        document.addEventListener("keyup", function(e) {
            self._emitKey(e, "up");
        });
    },

    _emitKey: function(e, press) {
        this._emit("{}.{}".format(keycodes[e.keyCode] || String.fromCharCode(e.keyCode), press));
    },
});

module.exports = new KeyObserver();
