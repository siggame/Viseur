// Do not modify this file
// This is a simple lookup object for each GameObject class
import { BaseGameObjectClasses } from "src/viseur/game/interfaces";
import { GameObject } from "./game-object";
import { Job } from "./job";
import { Player } from "./player";
import { Structure } from "./structure";
import { Tile } from "./tile";
import { Unit } from "./unit";

/** All the non Game classes in this game. */
export const GameObjectClasses: Readonly<BaseGameObjectClasses> = Object.freeze(
    {
        GameObject,
        Player,
        Tile,
        Structure,
        Unit,
        Job,
    },
);
