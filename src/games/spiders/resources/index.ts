import { createResources, load } from "src/viseur/renderer";

export const GameResources = createResources("Spiders", {
    // <<-- Creer-Merge: resources -->>
    test: load("test.png"), // load files like this,
                            // and remember to remove these lines and file!
    // <<-- /Creer-Merge: resources -->>
});
