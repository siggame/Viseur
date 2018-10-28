import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Pirates. */
export const GameResources = createResources("Pirates", {
    // <<-- Creer-Merge: resources -->>

    land: load("land.png"),
    water: load("water.png"),
    port: load("port.png"),
    ship: load("ship.png"),
    pirate: load("pirate.png"),
    dropShadow: load("dropShadow.png"),
    gold: load("gold.png"),
    rotatedPort: load("rotatedPort.png"),
    flag: load("flag.png"),
    shirt: load("shirt.png"),
    portColor: load("portColor.png"),
    rotatedPortColor: load("rotatedPortColor.png"),
    grass: load("grass.png"),
    plants: load("plants.png"),
    tree: load("tree.png"),
    water2: load("water2.png"),
    // <<-- /Creer-Merge: resources -->>
});
