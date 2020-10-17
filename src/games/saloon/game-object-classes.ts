// Do not modify this file
// This is a simple lookup object for each GameObject class
import { BaseGameObjectClasses } from "src/viseur/game/interfaces";
import { Bottle } from "./bottle";
import { Cowboy } from "./cowboy";
import { Furnishing } from "./furnishing";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";
import { YoungGun } from "./young-gun";

/** All the non Game classes in this game. */
export const GameObjectClasses: Readonly<BaseGameObjectClasses> = Object.freeze(
    {
        GameObject,
        Player,
        Tile,
        Cowboy,
        Furnishing,
        Bottle,
        YoungGun,
    },
);
