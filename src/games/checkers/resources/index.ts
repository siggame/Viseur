import { createResources, load } from "src/viseur/renderer";

export const GameResources = createResources("Checkers", {
    // <<-- Creer-Merge: resources -->>
    tileBlack: load("tile_black.png"),
    tileWhite: load("tile_white.png"),

    checker: load("Checker.png"),
    king: load("King.png"),
    // <<-- /Creer-Merge: resources -->>
});
