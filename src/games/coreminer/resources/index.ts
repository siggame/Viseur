import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Coreminer. */
export const GameResources = createResources("Coreminer", {
    // <<-- Creer-Merge: resources -->>
    minerLvl0: load("Level 0.png"),
    minerLvl1: load("Level 1.png"),
    minerLvl2: load("Level 2.png"),
    minerLvl3: load("Level 3.png"),
    dirt: load("Dirt.png"),
    dugDirt: load("Dug_Dirt.png"),
    bomb: load("bomb.png"),
    error: load("test.png"),
    // <<-- /Creer-Merge: resources -->>
});
