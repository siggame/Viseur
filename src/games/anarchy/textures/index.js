module.exports = {
    //<<-- Creer-Merge: settings -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // "example": "example.png",
    "tile": "tile.jpg",

    "building": "building_building.png",
    "dead": "building_dead.png",

    "warehouse_front": "building_warehouse_front.png",
    "policedepartment_front": "building_policedepartment_front.png",
    "weatherstation_front": "building_weatherstation_front.png",
    "firedepartment_front": "building_firedepartment_front.png",

    "warehouse_back": "building_warehouse_back.png",
    "policedepartment_back": "building_policedepartment_back.png",
    "weatherstation_back": "building_weatherstation_back.png",
    "firedepartment_back": "building_firedepartment_back.png",

    "graffiti_0": "graffiti_1.png",
    "graffiti_1": "graffiti_2.png",

    "beam": "beam.png",
    "arrow": "arrow.png",
    "rotation": {path: "rotation.png", width: 2, height: 2}, // this sprite is 2x2, not 1x1 like most

    "fire": {path: "fire.png", sheet: {width: 4, height: 2, axis: "x"}}, // we want 1,0 to be 1, then 2,0 to be 2, ..., then 1,0 to be 4
    //<<-- /Creer-Merge: settings -->>
};
