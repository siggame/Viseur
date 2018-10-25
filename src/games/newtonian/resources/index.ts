import { createResources, load } from "src/viseur/renderer";

export const GameResources = createResources("Newtonian", {
    // <<-- Creer-Merge: resources -->>
    test: load("test.png"), // load files like this,
    intern: load("intern.png"),
    physicist: load("physicist.png"),
    manager: load("manager.png"),
                            // and remember to remove these lines and file!
    // <<-- /Creer-Merge: resources -->>
});
