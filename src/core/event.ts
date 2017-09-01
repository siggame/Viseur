/** A simple container for all event listeners */
interface IListener<T> {
    /** Indicates if they should be removed after one emit */
    once: boolean;

    /** The callback to invoke */
    callback: (args: T) => any;
}

/** A typed event, given a type will emit values of that type to listeners */
export class Event<T extends any = undefined> {

    public static proxy<T extends Events, S extends Events>(eventsA: T, eventsB: S): T & S {
        return Object.freeze(Object.assign({}, eventsA, eventsB)) as any;
    }
    /** All the current listeners for this event */
    private listeners: Array<IListener<T>> = [];

    /**
     * Attaches a listener to trigger on all emits for this event
     * @param callback the callback to invoke on all emits
     */
    public on(callback: (data: T) => any): void {
        this.listeners.push({
            once: false,
            callback,
        });
    }

    /**
     * Attaches a listener to trigger on only the first emit for this event.
     * After that event is emitted this callback will automatically be removed.
     * @param callback the callback to invoke on only the first emit
     */
    public once(callback: (args: T) => any): void {
        this.listeners.push({
            once: true,
            callback,
        });
    }

    /**
     * Removes a callback from the listeners on this event,
     * regardless of once vs on.
     * @param callback the callback to remove
     * @returns true if a callback was removed, false otherwise
     */
    public off(callback: (args: T) => any): boolean {
        const originalLength = this.listeners.length;
        // remove all listeners that have the same callback as this one
        this.listeners = this.listeners.filter((l) => l.callback !== callback);

        return this.listeners.length !== originalLength;
    }

    /**
     * Emits a value to all the listeners
     * @param arg the argument to emit to all listeners
     */
    public emit(arg: T): void {
        for (const listener of this.listeners) {
            listener.callback(arg);
        }

        // remove all listeners that only wanted to listen once
        this.listeners = this.listeners.filter((l) => !l.once);
    }
}

export type Events = Readonly<{
    // [eventName: string]: Event<any>;
}>;

export function events<T>(lookup: T): Readonly<T> {
    return Object.freeze(lookup);
}
