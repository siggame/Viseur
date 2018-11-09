import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Saloon. */
export const GameResources = createResources("Saloon", {
    // <<-- Creer-Merge: resources -->>

    // Tiles
    hazardBrokenGlass: load("broken_glass.png"),
    tile: load("tile.jpg"),
    wall: load("wall.jpg"),
    wallSide: load("wall_side.jpg"),
    shade: load("shade.jpg"),
    wallCorner: load("wall_corner.jpg"),
    railHorizontal: load("rail_h.png"),
    railVertical: load("rail_v.png"),

    // Cowboys
    cowboySharpshooterBottom: load("cowboy_sharpshooter_bottom.png"),
    cowboyBartenderBottom: load("cowboy_bartender_bottom.png"),
    cowboyBrawlerBottom: load("cowboy_brawler_bottom.png"),

    cowboySharpshooterTop: load("cowboy_sharpshooter_top.png"),
    cowboyBartenderTop: load("cowboy_bartender_top.png"),
    cowboyBrawlerTop: load("cowboy_brawler_top.png"),

    // Furnishings
    piano: load("piano.png"),
    furnishing: load("furnishing.png"),

    // YoungGuns
    youngGunTop: load("young-gun_top.png"),
    youngGunBottom: load("young-gun_bottom.png"),

    // Misc
    bottle: load("bottle.png"),
    shotHead: load("shot_head.png"),
    shotBody: load("shot_body.png"),
    hit: load("hit.png"),
    music: load("music.png"),
    brawlAttack: load("brawl-attack.png"),

    // <<-- /Creer-Merge: resources -->>
});
