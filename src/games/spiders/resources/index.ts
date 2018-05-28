import { createResources, load } from "src/viseur/renderer";

export const GameResources = createResources("Spiders", {
    // <<-- Creer-Merge: resources -->>
    background: load("background.jpg", {
        width: 16,
        height: 9,
    }),

    nest: load("nest.png"),
    // <<-- /Creer-Merge: resources -->>
});
