import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Chess. */
export const GameResources = createResources("Chess", {
    // <<-- Creer-Merge: resources -->>
    piecesTop: load("./pieces-top.png", {
        sheet: { width: 3, height: 2, axis: "x" },
    }),
    piecesBottom: load("./pieces-bottom.png", {
        sheet: { width: 3, height: 2, axis: "x" },
    }),

    tileWhite: load("./tile-white.png"),
    tileBlack: load("./tile-black.png"),

    overlay: load("./overlay.png"),
    // <<-- /Creer-Merge: resources -->>
});
