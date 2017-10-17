import { createResources, load } from "src/viseur/renderer";

export const GameResources = createResources("Catastrophe", {
    // <<-- Creer-Merge: resources -->>
    builderHuman: load("BuilderHuman.png"),
    freshHuman: load("FreshHuman.png"),
    friendlyHuman: load("FriendlyHuman.png"),
    soldierUnit: load("soldier.png"),
    converterUnit: load("converter.png"),
    gathererUnit: load("gatherer.png"),
    catOverlord: load("overlord.png"),

    groundTile: load("groundTile.png"),
    shelterTile: load("shelterTile.png"),
    monumentTile: load("monumentTile.png"),
    // <<-- /Creer-Merge: resources -->>
});
