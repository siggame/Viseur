import { createResources, load } from "src/viseur/renderer";

export const GameResources = createResources("Newtonian", {
    // <<-- Creer-Merge: resources -->>

    floor: load("floor.jpg"),
    floor2: load("floor2.png"),
    wall: load("wall.png"),
    spawn: load("spawn.jpg"),
    genRoom: load("genRoom.jpg"),
    conveyor: load("conveyor.jpg"),
    intern: load("intern.png"),
    physicist: load("physicist.png"),
    manager: load("manager.png"),
    machine: load("machine.png"),
    indicator: load("bubble3.png"),
    redore: load("rediumore.png"),
    blueore: load("blueiumore.png"),
    red: load("redium.png"),
    blue: load("blueium.png"),
    // load files like this,
    // and remember to remove these lines and file!
    // <<-- /Creer-Merge: resources -->>
});
