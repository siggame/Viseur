import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in JungleChess. */
export const GameResources = createResources("JungleChess", {
    // <<-- Creer-Merge: resources -->>
    test: load("test.png"), // load files like this,
                            // and remember to remove these lines and file!
    // <<-- /Creer-Merge: resources -->>
});
