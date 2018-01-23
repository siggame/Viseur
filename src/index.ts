/*
 * this is the main entry point for Viseur.
 *   once the web page is ready (all files downloaded),
 *   it creates a single new instance of the Viseur class, and from that class all the magic happens!
 */

const anyWindow = window as any;

window.onerror = (message, source, lineno, colno, error) => {
    if (anyWindow.viseur) {
        anyWindow.viseur.handleError(error, source, lineno, colno, message);
    }
};

// require("font-awesome-webpack");
import "font-awesome-sass-loader";
import * as $ from "jquery";
import "./core/";

$(document).ready(() => {
    const viseur = require("./viseur");
    anyWindow.viseur = viseur;

    viseur.start();
});
