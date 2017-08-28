import { Event } from "src/core/event";

/** Represents a key on the keyboard */
export class Key {
    /** Emitted when this key goes up (after a down) */
    public readonly up = new Event<KeyboardEvent>();

    /** Emitted when this key goes down */
    public readonly down = new Event<KeyboardEvent>();

    constructor(
        /** The keycode this Key listens for */
        public readonly code: number,

        /** The human readable name of the key */
        public readonly name: string,
    ) {}
}
