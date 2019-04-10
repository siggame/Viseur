import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Stardash. */
export const GameResources = createResources("Stardash", {
    // <<-- Creer-Merge: resources -->>
    background: load("spacebackground.png"),
    test: load("test.png"),
    sun: load("sun.png"),
    earth_planet: load("earth_planet.png"),
    alien_planet: load("alien_planet.png"),
    genarium: load("genarium.png"),
    rarium: load("rarium.png"),
    legendarium: load("legendarium.png"),
    mythicite: load("mythicite.png"),
    corvette: load("corvette.png"),
    miner: load("miner.png"),
    martyr: load("martyr.png"),
    missleboat: load("missleboat.png"),
    transport: load("transport.png"),
    // <<-- /Creer-Merge: resources -->>
});
