// Do not modify this file
// This is a simple lookup object for each GameObject class
import { BaseGameObjectClasses } from "src/viseur/game/interfaces";
import { Bomb } from "./bomb";
import { GameObject } from "./game-object";
import { Miner } from "./miner";
import { Player } from "./player";
import { Tile } from "./tile";
import { Upgrade } from "./upgrade";

/** All the non Game classes in this game. */
export const GameObjectClasses: Readonly<BaseGameObjectClasses> = Object.freeze(
    {
        GameObject,
        Player,
        Tile,
        Miner,
        Upgrade,
        Bomb,
    },
);
