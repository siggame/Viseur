import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Newtonian. */
export const GameResources = createResources("Newtonian", {
    // <<-- Creer-Merge: resources -->>

    floor: load("floor.png"),
    wall: load("wall.png"),
    spawn: load("spawn.jpg"),
    genRoom: load("genRoom.jpg"),
    conveyor: load("conveyor.png"),
    intern: load("intern.png"),
    physicist: load("physicist.png"),
    manager: load("manager.png"),
    machine: load("machine.png"),
    indicator: load("bubble3.png"),
    redore: load("rediumore.png"),
    blueore: load("blueiumore.png"),
    red: load("redium.png"),
    blue: load("blueium.png"),
    door: load("door.png"),
    openDoor: load("openDoor.png"),
    eastDoor: load("eastDoor.png"),
    eastOpenDoor: load("eastOpenDoor.png"),
    // load files like this,
    // and remember to remove these lines and file!
    // <<-- /Creer-Merge: resources -->>
});
