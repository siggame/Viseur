import { createResources, load } from "src/viseur/renderer";

export const GameResources = createResources("Catastrophe", {
    // <<-- Creer-Merge: resources -->>
    dropShadow: load("unit_drop_shadow.png"),
    builderHuman: load("builder.png"),
    freshHuman: load("human.png"),
    soldierUnit: load("soldier.png"),
    converterUnit: load("converter.png"),
    gathererUnit: load("gatherer.png"),
    catOverlord: load("overlord.png"),

    grass1: load("grass1.png"),
    grass2: load("grass2.png"),
    grass3: load("grass3.png"),
    road: load("cut_road.png"),
    shelter: load("shelter.png"),
    monument: load("statue.png"),
    neutral: load("neutral.png"),
    // <<-- /Creer-Merge: resources -->>
});
