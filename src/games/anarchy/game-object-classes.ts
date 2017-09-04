// Do not modify this file
// This is a simple lookup object for each GameObject class
import { IBaseGameObjectClasses } from "src/viseur/game/interfaces";
import { Building } from "./building";
import { FireDepartment } from "./fire-department";
import { Forecast } from "./forecast";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { PoliceDepartment } from "./police-department";
import { Warehouse } from "./warehouse";
import { WeatherStation } from "./weather-station";

/** All the non Game classes in this game */
export const GameObjectClasses: Readonly<IBaseGameObjectClasses> = Object.freeze({
    PoliceDepartment,
    Player,
    Warehouse,
    Forecast,
    Building,
    GameObject,
    FireDepartment,
    WeatherStation,
}) as any;
