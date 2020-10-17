// Do not modify this file
// This is a simple lookup object for each GameObject class
import { BaseGameObjectClasses } from "src/viseur/game/interfaces";
import { Beaver } from "./beaver";
import { GameObject } from "./game-object";
import { Job } from "./job";
import { Player } from "./player";
import { Spawner } from "./spawner";
import { Tile } from "./tile";

/** All the non Game classes in this game. */
export const GameObjectClasses: Readonly<BaseGameObjectClasses> = Object.freeze(
    {
        GameObject,
        Player,
        Tile,
        Spawner,
        Beaver,
        Job,
    },
);
