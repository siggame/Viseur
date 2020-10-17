// Do not modify this file
// This is a simple lookup object for each GameObject class
import { BaseGameObjectClasses } from "src/viseur/game/interfaces";
import { BroodMother } from "./brood-mother";
import { Cutter } from "./cutter";
import { GameObject } from "./game-object";
import { Nest } from "./nest";
import { Player } from "./player";
import { Spider } from "./spider";
import { Spiderling } from "./spiderling";
import { Spitter } from "./spitter";
import { Weaver } from "./weaver";
import { Web } from "./web";

/** All the non Game classes in this game. */
export const GameObjectClasses: Readonly<BaseGameObjectClasses> = Object.freeze(
    {
        GameObject,
        Player,
        Nest,
        Web,
        Spider,
        BroodMother,
        Spiderling,
        Spitter,
        Weaver,
        Cutter,
    },
);
