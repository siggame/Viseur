import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Coreminer. */
export const GameResources = createResources("Coreminer", {
    // <<-- Creer-Merge: resources -->>
    minerLvl0: load("Base Unit Smooth.png"),
    minerLvl1: load("Drill Smooth Level1.png"),
    minerLvl2: load("Drill Smooth Level2.png"),
    minerLvl3: load("Drill Smooth Level3.png"),
    dirt: load("Dirt.png"),
    dugDirt: load("Dug_Dirt.png"),
    bomb: load("bomb.png"),
    error: load("test.png"),
    base: load("base base.png"),
    ladder: load("ladder.png"),
    sky: load("Sky-tile.png"),
    support: load("support.png"),
    miningTube: load("Mining-tube.png"),
    shield: load("Shield.png"),
    ore: load("ore.png"),
    explosion: load("explosion.png"),
    // <<-- /Creer-Merge: resources -->>
});
