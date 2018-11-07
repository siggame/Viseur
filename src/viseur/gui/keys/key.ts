import { Event } from "ts-typed-events";

/** Represents a key on the keyboard */
export class Key {
    /** Emitted when this key goes up (after a down) */
    public readonly up = new Event<KeyboardEvent>();

    /** Emitted when this key goes down */
    public readonly down = new Event<KeyboardEvent>();

    /**
     * Creates a Key to observe an event on that key.
     *
     * @param code - They key code we represent.
     * @param name - The name of the key we represent.
     */
    constructor(
        /** The keycode this Key listens for. */
        public readonly code: number,

        /** The human readable name of the key. */
        public readonly name: string,
    ) {}
}
