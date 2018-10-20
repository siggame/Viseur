/*
 * This is the main entry point for Viseur.
 *   Once the web page is ready (all files downloaded)
 *   it creates a single new instance of the Viseur class;
 *   and from that class all the magic happens!
 */

// tslint:disable:no-import-side-effect no-any no-unsafe-any no-require-imports
import "font-awesome-sass-loader";
import * as $ from "jquery";
import * as PIXI from "pixi.js";
import "./core/";

// Skips the hello message being printed to the console.
PIXI.utils.skipHello();

$(document).ready(() => {
    const required = require("./viseur");
    const viseur = new required.Viseur();

    if (process.env.NODE_ENV === "development") {
        // Globals for easier debugging.
        (window as any).viseur = viseur;
        (window as any).$ = $;
    }
});
