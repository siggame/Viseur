import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Catastrophe. */
export const GameResources = createResources("Catastrophe", {
    // <<-- Creer-Merge: resources -->>
    dropShadow: load("unit_drop_shadow.png"),
    builderHuman: load("builder.png"),
    freshHuman: load("human.png"),
    soldierUnit: load("soldier.png"),
    converterUnit: load("converter.png"),
    gathererUnit: load("gatherer.png"),
    catOverlord: load("overlord.png"),

    bush: load("plain_bush.png"),
    berry: load("plain_berries.png"),
    indicator: load("bubble3.png"),

    grass1: load("grass1.png"),
    grass2: load("grass2.png"),
    grass3: load("grass3.png"),
    road: load("cut_road.png"),
    shelter: load("shelter.png"),
    monument: load("statue.png"),
    neutral: load("neutral.png"),
    wall: load("wall_sprite.png"),
    // <<-- /Creer-Merge: resources -->>
});
