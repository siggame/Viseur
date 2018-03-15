import { Event } from "ts-typed-events";
import { Viseur } from "./viseur";

/** The event emitted after viseur has started and everything is ready */
export const viseurConstructed = new Event<Viseur>();
