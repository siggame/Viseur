import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Necrowar. */
export const GameResources = createResources("Necrowar", {
    // <<-- Creer-Merge: resources -->>
    test: load("test.png"),
    archerTower: load("archerTower.png"),
    aoe: load("aoeTower.png"),
    ballistaArrow: load("ballistaArrow.png"),
    ballistaTower: load("ballistaTower.png"),
    castle: load("castle.png"),
    cleansingTower: load("cleansingTower.png"),
    goldMine: load("goldmine1.png"),
    islandGoldmine: load("goldMine.png"),
    grass: load("grass.png"),
    manaFish: load("manaFish.png"),
    path: load("path.png"),
    pentagram: load("pentagram.png"),
    water: load("water.png"),
    abomination: load("abomination.png"),
    dog: load("dog.png"),
    ghoul: load("ghoul.png"),
    zombie: load("zombie.png"),
    horde: load("horde.png"),
    horseman: load("horseman.png"),
    necromancer: load("necromancer.png"),
    skeleton: load("skeleton.png"),
    wraith: load("wraith.png"),
    unitSpawn: load("spawn.png"),
    workerSpawn: load("spawn1.png"),

    // <<-- /Creer-Merge: resources -->>
});
