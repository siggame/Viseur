import { createResources, load } from "src/viseur/renderer";

export const GameResources = createResources("Catastrophe", {
    // <<-- Creer-Merge: resources -->>
    builderHuman: load("builder.png"),
    freshHuman: load("human.png"),
    // friendlyHuman: load("f.png"),
    soldierUnit: load("soldier.png"),
    converterUnit: load("converter.png"),
    gathererUnit: load("gatherer.png"),
    catOverlord: load("overlord.png"),

    grass1: load("grass1.png"),
    grass2: load("grass2.png"),
    grass3: load("grass3.png"),
    shelter: load("shelter.png"),
    monument: load("statue.png"),
    // <<-- /Creer-Merge: resources -->>
});
