import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Spiders. */
export const GameResources = createResources("Spiders", {
    // <<-- Creer-Merge: resources -->>
    background: load("background.jpg", {
        width: 16,
        height: 9,
    }),

    broodmotherTop: load("./broodmother-top.png"),
    broodmotherBottom: load("./broodmother-bottom.png"),

    nest: load("nest.png"),

    webMiddle: load("web-middle.png"),
    webEnd: load("web-end.png"),
    // <<-- /Creer-Merge: resources -->>
});
