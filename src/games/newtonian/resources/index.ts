import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Newtonian. */
export const GameResources = createResources("Newtonian", {
    // <<-- Creer-Merge: resources -->>

    // Tiles
    floor: load("floor.png"),
    wall: load("wall.png"),
    spawn: load("spawn.jpg"),
    genRoom: load("genRoom.jpg"),
    conveyor: load("conveyor.png"),
    machine: load("machine.png"),

    // Resources on tiles
    resourceBar: load("./resource-bar.png"),
    resourceOre: load("./resource-ore.png"),

    // Unit by jobs
    internBottom: load("./intern-bottom.png"),
    internTop: load("./intern-top.png"),
    physicistBottom: load("./physicist-bottom.png"),
    physicistTop: load("./physicist-top.png"),
    managerBottom: load("./manager-bottom.png"),
    managerTop: load("./manager-top.png"),

    // intern: load("intern.png"),
    // physicist: load("physicist.png"),
    // manager: load("manager.png"),
    // redore: load("rediumore.png"),
    // blueore: load("blueiumore.png"),
    //  red: load("redium.png"),
    // blue: load("blueium.png"),
    door: load("door.png"),
    openDoor: load("openDoor.png"),
    eastDoor: load("eastDoor.png"),
    eastOpenDoor: load("eastOpenDoor.png"),
    // load files like this,
    // and remember to remove these lines and file!
    // <<-- /Creer-Merge: resources -->>
});
