import { createResources, load } from "src/viseur/renderer";

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
    water2: load("water.png"),

    test: load("test.png"), // load files like this,
                            // and remember to remove these lines and file!
    // <<-- /Creer-Merge: resources -->>
});
