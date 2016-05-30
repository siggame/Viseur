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
    },

    /**
     * @override
     */
    setValue: function(newValue) {}, // can't set
});

module.exports = File;
