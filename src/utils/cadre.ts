import { isObject, UnknownObject } from "cadre-ts-utils";

export function hasGameObjectWithID<
    TObj extends UnknownObject,
    TName extends string,
    TID extends string,
>(
    obj: TObj,
    name: TName,
    id: TID,
): obj is TObj & ({ [K in TName]: { id: TID } }) {
    const gameObject = obj[name];
    if (!isObject(gameObject)) {
        return false;
    }

    return gameObject.id === id;
}
