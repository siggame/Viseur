var $ = require("jquery");
var Classe = require("classe");
var BaseInput = require("./baseInput");

/**
 * @class File - a file input
 */
var File = Classe(BaseInput, {
    init: function(args) {
        BaseInput.init.call(this, $.extend({
            type: "file",
        }, args));

        var self = this;
        this.$element.on("change", function() {
            self._load();
        });
    },

    /**
     * loads the contents of the chosen file
     */
    _load: function() {
        this._emit("loading");

        var reader = new FileReader();

        var self = this;
        reader.onload = function() {
            self._emit("loaded", reader.result);
        };

        var file = this.$element[0].files[0];
        reader.readAsText(file);
    },

    /**
     * @override
     */
    setValue: function(newValue) {}, // can't set
});

module.exports = File;
