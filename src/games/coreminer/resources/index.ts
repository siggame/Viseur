import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Coreminer. */
export const GameResources = createResources("Coreminer", {
    // <<-- Creer-Merge: resources -->>
    test: load("test.png"), // load files like this,
                            // and remember to remove these lines and file!
    // <<-- /Creer-Merge: resources -->>
});
