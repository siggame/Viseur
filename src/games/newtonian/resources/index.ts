import { createResources, load } from "src/viseur/renderer";

export const GameResources = createResources("Newtonian", {
    // <<-- Creer-Merge: resources -->>

    floor: load("floor.jpg"),
    wall: load("wall.png"),
    spawn: load("spawn.jpg"),
    genRoom: load("genRoom.jpg"),
    conveyor: load("conveyor.jpg"),
    intern: load("intern.png"),
    physicist: load("physicist.png"),
    manager: load("manager.png"),
    machine: load("test.png"),
    indicator: load("bubble3.png"),
    redore: load("redore.png"),
    blueore: load("blueore.png"),
    red: load("red.png"),
    blue: load("blue.png"),
    // load files like this,
    // and remember to remove these lines and file!
    // <<-- /Creer-Merge: resources -->>
});
