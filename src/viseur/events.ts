import { Event, events } from "ts-typed-events";
import { BaseGame } from "./game/base-game";
import { IGamelog } from "./game/gamelog";
import { ICurrentTime } from "./time-manager";
import { IViseurGameState } from "./viseur";

/** The events Viseur emits */
export const ViseurEvents = events({
    /** Triggers when the game's state changes and sends the new state */
    stateChanged: new Event<IViseurGameState>(),

    /** Triggers when the timer ticks */
    timeUpdated: new Event<ICurrentTime>(),

    /** Triggers literally 1 second after the ready event */
    delayedReady: new Event<undefined>(),

    /** Triggers when all async events are done and we are ready to being normal operations */
    ready: new Event<{game: BaseGame, gamelog: IGamelog}>(),

    /** Triggered during loading of the gamelog if the gamelog is found at a remote url */
    gamelogIsRemote: new Event<{url?: string}>(),

    /** Triggered when the gamelog has been loaded */
    gamelogLoaded: new Event<IGamelog>(),

    /** Triggers when a steaming gamelog is updated in some way, probably a new delta */
    gamelogUpdated: new Event<IGamelog>(),

    /**
     * Triggers when a streaming gamelog is finished streaming and will no longer change.
     * In addition a url to the finalized gamelog (with other player's non obfuscated data) will be emitted
     */
    gamelogFinalized: new Event<{ gamelog: IGamelog, url: string }>(),

    // -- connection events -- \\

    /** Triggers when a connection event occurs and we have some message to send */
    connectionConnected: new Event<undefined>(),

    /** Triggers when a connection event occurs and we have some message to send */
    connectionMessage: new Event<string>(),

    /** Triggers when a connection that was opened is closed, including data if it closed due to a timeout */
    connectionClosed: new Event<{timedOut: boolean}>(),

    /** Triggers when a connection encounters and error, and emits that error */
    connectionError: new Event<Error>(),
});
