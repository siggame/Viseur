// Do not modify this file
// This is a simple lookup object for each GameObject class
import { BaseGameObjectClasses } from "src/viseur/game/interfaces";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";
import { Tower } from "./tower";
import { TowerJob } from "./tower-job";
import { Unit } from "./unit";
import { UnitJob } from "./unit-job";

/** All the non Game classes in this game. */
export const GameObjectClasses: Readonly<BaseGameObjectClasses> = Object.freeze(
    {
        GameObject,
        Player,
        Tile,
        Tower,
        Unit,
        UnitJob,
        TowerJob,
    },
);
