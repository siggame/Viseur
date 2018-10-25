import { createResources, load } from "src/viseur/renderer";

export const GameResources = createResources("Newtonian", {
    // <<-- Creer-Merge: resources -->>
    floor: load("floor.jpg"),
    wall: load("wall.png"),
    spawn: load("spawn.jpg"),
    genRoom: load("genRoom.jpg"),
    conveyor: load("conveyor.jpg"),
    intern: load("intern.png"),

    // load files like this,
                            // and remember to remove these lines and file!
    // <<-- /Creer-Merge: resources -->>
});
