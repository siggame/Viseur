import { createEventEmitter } from "ts-typed-events";
import { Viseur } from "./viseur";

/** Should only be used by the singleton Viseur instance. */
export const emitViseurConstructed = createEventEmitter<Viseur>();

/** The event emitted after viseur has started and everything is ready. */
export const eventViseurConstructed = emitViseurConstructed.event;

/** The singleton instance of this Viseur once it is constructed. */
export let ViseurInstance: Viseur | undefined;
eventViseurConstructed.once((vis) => {
    ViseurInstance = vis;
});
