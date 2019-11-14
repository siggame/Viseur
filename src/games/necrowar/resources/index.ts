import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Necrowar. */
export const GameResources = createResources("Necrowar", {
    // <<-- Creer-Merge: resources -->>
    test: load("test.png"),
    archerTower: load("archerTower.png"),
    arrow: load("arrow.png"),
    ballistaArrow: load("ballistaArrow.png"),
    ballistaTower: load("ballitsaTower.png"),
    castle: load("castle.png"),
    cleansingTower: load("cleansingTower.png"),
    goldMine: load("goldMine.png"),
    grass: load("grass.png"),
    manaFish: load("manaFish.png"),
    path: load("path.png"),
    pentagram: load("pentagram.png"),
    water: load("water.png"),
    abomination: load("abomination.png"),
    dog: load("dog.png"),
    ghould: load("ghoul.png"),
    zombie: load("zombie.png"),
    horde: load("horde.png"),
    horseman: load("horseman.png"),
    necromancer: load("necromancer.png"),
    skeleton: load("skeleton.png"),
    wraith: load("wraith.png"),

   // <<-- /Creer-Merge: resources -->>
});
