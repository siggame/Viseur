import { mapKeys, mapValues } from "lodash";
import { KEY_NAME_TO_CODE } from "src/core/key-codes";
import { Key } from "./key";

const createKeysFrom = <T extends Record<string, number>>(
    keys: T,
): { [K in keyof T]: Key } =>
    mapValues(keys, (code, name) => new Key(code, name));

/** All keys, indexed by name, to listen to. */
export const KEYS = createKeysFrom(KEY_NAME_TO_CODE);

/** All the keys, indexed by key code, to listen to. */
export const KEY_FROM_CODE: { [key: number]: Key | undefined } = mapKeys(
    KEYS,
    (key) => key.code,
);

document.addEventListener("keydown", (keyboardEvent) => {
    const key = KEY_FROM_CODE[keyboardEvent.keyCode];

    if (key) {
        key.down.emit(keyboardEvent);
    }
});

document.addEventListener("keyup", (keyboardEvent) => {
    const key = KEY_FROM_CODE[keyboardEvent.keyCode];

    if (key) {
        key.up.emit(keyboardEvent);
    }
});
