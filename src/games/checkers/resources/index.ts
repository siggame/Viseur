import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Checkers. */
export const GameResources = createResources("Checkers", {
    // <<-- Creer-Merge: resources -->>
    piece: load("piece.png"),
    kinged: load("kinged.png"),

    tileBlack: load("tile-black.png"),
    tileRed: load("tile-red.png"),
    // <<-- /Creer-Merge: resources -->>
});
