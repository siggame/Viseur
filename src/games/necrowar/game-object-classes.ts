// Do not modify this file
// This is a simple lookup object for each GameObject class
import { IGameObjectClasses } from "src/viseur/game/interfaces";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { tJob } from "./t-job";
import { Tile } from "./tile";
import { Tower } from "./tower";
import { uJob } from "./u-job";
import { Unit } from "./unit";

/** All the non Game classes in this game */
export const GameObjectClasses: Readonly<IGameObjectClasses> = Object.freeze({
    GameObject,
    Player,
    Tile,
    Tower,
    Unit,
    uJob,
    tJob,
});
