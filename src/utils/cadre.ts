import { isObject, UnknownObject } from "@cadre/ts-utils";
import { BaseGameObject, BasePlayer } from "@cadre/ts-utils/cadre";
import { BaseTile } from "src/viseur/game";

/**
 * Checks if an object has a given key in it that appears to be a game object or game object reference.
 *
 * @param obj - The object to inspect.
 * @param name - The property name in obj to look for.
 * @param id - The given ID to check for, if not the same returns false.
 * @returns True if all the above match, false otherwise.
 */
export function hasGameObjectWithID<
    TObj extends UnknownObject,
    TName extends string,
    TID extends string
>(
    obj: TObj,
    name: TName,
    id: TID,
): obj is TObj &
    {
        [K in TName]: {
            /** The id of the GameObject. */
            id: TID;
        };
    } {
    const gameObject = obj[name];
    if (!isObject(gameObject)) {
        return false;
    }

    return gameObject.id === id;
}

/**
 * Gets the text to display a game object in human readable form.
 *
 * @param gameObject - The game object to get the text for.
 * @returns A human readable string representing this unique game object.
 */
export function getGameObjectDisplayText(gameObject: BaseGameObject): string {
    let displayValue = "";
    switch (gameObject.gameObjectName) {
        case "Player":
            displayValue = `Player "${(gameObject as BasePlayer).name}"`;
            break;
        case "Tile": {
            const tile = (gameObject as unknown) as BaseTile;
            displayValue = `Tile (${tile.x}, ${tile.y})`;
            break;
        }
        default:
            displayValue = gameObject.gameObjectName;
    }
    displayValue += ` #${gameObject.id}`;
    return displayValue;
}
