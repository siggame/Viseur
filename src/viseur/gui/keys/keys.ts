import { mapKeys, mapValues } from "lodash";
import { createEventEmitter } from "ts-typed-events";
import { KEY_NAME_TO_CODE } from "src/core/key-codes";

const keyEmitters = mapValues(KEY_NAME_TO_CODE, (code: number, name) => ({
    code,
    name,
    up: createEventEmitter<KeyboardEvent>(),
    down: createEventEmitter<KeyboardEvent>(),
}));

/** All keys, indexed by name, to listen to. */
export const KEYS = mapValues(keyEmitters, ({ up, down }) => ({
    up: up.event,
    down: down.event,
}));

/** All the keys, indexed by key code, to listen to. */
const keyEmittersFromCode = mapKeys(keyEmitters, (key) => key.code);

document.addEventListener("keydown", (keyboardEvent) => {
    // TODO: find alternative to `keyCode`
    const key = keyEmittersFromCode[keyboardEvent.keyCode];

    if (key) {
        key.down.emit(keyboardEvent);
    }
});

document.addEventListener("keyup", (keyboardEvent) => {
    const key = keyEmittersFromCode[keyboardEvent.keyCode];

    if (key) {
        key.up.emit(keyboardEvent);
    }
});
