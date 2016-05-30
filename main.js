require("font-awesome-webpack");
require("./extensions/");
require("./core/");

var $ = require("jquery");

$(document).on("ready", function() {
    document.viseur = require("./viseur");
    document.viseur.start();
});
