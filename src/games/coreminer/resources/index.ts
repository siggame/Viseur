import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Coreminer. */
export const GameResources = createResources("Coreminer", {
    // <<-- Creer-Merge: resources -->>
    test: load("test.png"), // load files like this,
    //Default P1 here
    //Default P2 here
    minerHealthUp1P1: load("Armor Level 1 Team 1.png"),
    minerHealthUp2P1: load("Armor Level 2 Team 1.png"),
    minerHealthUp3P1: load("Armor Level 3 Team 1.png"),
    minerHealthUp1P2: load("Armor Level 1 Team 2.png"),
    minerHealthUp2P2: load("Armor Level 2 Team 2.png"),
    minerHealthUp3P2: load("Armor Level 3 Team 2.png"),
    minerCargoUp1P1: load("Cargo Level 1 Team 1.png"),
    minerCargoUp2P1: load("Cargo Level 2 Team 1.png"),
    minerCargoUp3P1: load("Cargo Level 3 Team 1.png"),
    minerCargoUp1P2: load("Cargo Level 1 Team 2.png"),
    minerCargoUp2P2: load("Cargo Level 2 Team 2.png"),
    minerCargoUp3P2: load("Cargo Level 3 Team 2.png"),
    minerPowerUp1P1: load("Drill Level 1 Team 1.png"),
    minerPowerUp2P1: load("Drill Level 2 Team 1.png"),
    minerPowerUp3P1: load("Drill Level 3 Team 1.png"),
    minerPowerUp1P2: load("Drill Level 1 Team 2.png"),
    minerPowerUp2P2: load("Drill Level 2 Team 2.png"),
    minerPowerUp3P2: load("Drill Level 3 Team 2.png"),
    minerMoveUp1P1: load("Movement Level 1 Team 1.png"),
    minerMoveUp2P1: load("Movement Level 2 Team 1.png"),
                            // and remember to remove these lines and file!
    // <<-- /Creer-Merge: resources -->>
});
