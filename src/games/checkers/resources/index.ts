import { createResources, load } from "src/viseur/renderer";

export const GameResources = createResources("Checkers", {
    // <<-- Creer-Merge: resources -->>
    piece: load("piece.png"),
    kinged: load("kinged.png"),
    // <<-- /Creer-Merge: resources -->>
});
