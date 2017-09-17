import { createResources, load } from "src/viseur/renderer";

export const GameResources = createResources("Stumped", {
    // <<-- Creer-Merge: resources -->>
    // "example": load("example.png"),
    beaver_0: load("beaver_0.png"),
    beaver_1: load("beaver_1.png"),
    beaver_tail: load("beaver_tail.png"),
    distracted_1: load("distracted_1.png"),
    distracted_2: load("distracted_2.png"),
    distracted_3: load("distracted_3.png"),
    job_builder: load("job_builder.png"),
    job_tank: load("job_bulky.png"),
    job_fighter: load("job_fighter.png"),
    job_gatherer: load("job_hungry.png"),
    job_hotlady: load("job_sexylady.png"),
    job_swimmer: load("job_swift.png"),
    lodge_bottom: load("lodge_bottom.png"),
    lodge_top: load("lodge_top.png"),
    attacking: load("status_attacking.png"),
    getting_branch: load("status_branches.png"),
    getting_food: load("status_food.png"),
    flow: load("tile_flow_direction.png"),
    tile_branch: load("tile_branches.png"),
    tile_food: load("tile_food.png"),
    tile_land: load("tile_land.png"),
    tile_water: load("tile_water.png"),
    tileset: load("tileset.png"),
    tree_0: load("tree_0.png"),
    tree_1: load("tree_1.png"),
    tree_2: load("tree_2.png"),
    tree_3: load("tree_3.png"),
    // <<-- /Creer-Merge: resources -->>
});
