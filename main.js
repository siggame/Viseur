/*
 * this is the main entry point for Visuer.
 *   once the web page is ready (all files downloaded),
 *   it creates a single new instance of the Viseur class, and from that class all the magic happens!
 */

window.onerror = function(message, source, lineno, colno, error) {
    if(window.viseur) {
        window.viseur.handleError(error, source, lineno, colno, message);
    }
};

require("font-awesome-webpack");
require("./extensions/");
require("./core/");

var $ = require("jquery");

$(document).on("ready", function() {
    window.viseur = require("./viseur");
    window.viseur.start();
});
