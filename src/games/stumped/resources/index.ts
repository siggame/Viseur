import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Stumped. */
export const GameResources = createResources("Stumped", {
    // <<-- Creer-Merge: resources -->>
    // "example": load("example.png"),
    beaver0: load("beaver_0.png"),
    beaver1: load("beaver_1.png"),

    beaverTail: load("beaver_tail.png"),

    distracted1: load("distracted_1.png"),
    distracted2: load("distracted_2.png"),
    distracted3: load("distracted_3.png"),

    jobFighter: load("job_fighter.png"),
    jobBulky: load("job_bulky.png"),
    jobHungry: load("job_hungry.png"),
    jobSwift: load("job_swift.png"),
    jobHotLady: load("job_sexylady.png"),
    jobBuilder: load("job_builder.png"),

    lodgeBottom: load("lodge_bottom.png"),
    lodgeTop: load("lodge_top.png"),
    attacking: load("status_attacking.png"),
    gettingBranch: load("status_branches.png"),
    gettingFood: load("status_food.png"),
    flow: load("tile_flow_direction.png"),
    tileBranch: load("tile_branches.png"),
    tileFood: load("tile_food.png"),
    tileLand: load("tile_land.png"),
    tileWater: load("tile_water.png"),
    tileset: load("tileset.png", {
        sheet: {
            axis: "x",
            width: 8,
            height: 6,
        },
    }),
    branches0: load("tree_0.png"),
    branches1: load("tree_1.png"),
    branches2: load("tree_2.png"),
    branches3: load("tree_3.png"),

    food0: load("food_0.png"),
    food1: load("food_1.png"),
    food2: load("food_2.png"),
    food3: load("food_3.png"),
    // <<-- /Creer-Merge: resources -->>
});
