import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Newtonian. */
export const GameResources = createResources("Newtonian", {
    // <<-- Creer-Merge: resources -->>

    // Tiles
    floor: load("floor.jpg"),
    wall: load("wall.png"),
    spawn: load("spawn.jpg"),
    genRoom: load("genRoom.jpg"),
    conveyor: load("conveyor.jpg"),
    indicator: load("bubble3.png"),
    machine: load("test.png"),

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

    // <<-- /Creer-Merge: resources -->>
});
