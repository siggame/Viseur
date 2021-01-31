import { Immutable } from "src/utils";
import { createEventEmitter } from "ts-typed-events";
import { BaseGame } from "./game/base-game";
import { GamelogWithReverses } from "./game/gamelog";
import { ViseurGameState } from "./game/interfaces";
import { CurrentTime } from "./time-manager";

/** The events Viseur emits. */
export class ViseurEvents {
    /** The event emitter for the stateChanged. */
    protected emitStateChanged = createEventEmitter<
        Immutable<ViseurGameState>
    >();

    /** Triggers when the game's state changes and sends the new state. */
    public eventStateChanged = this.emitStateChanged.event;

    /** The event emitter for the stateChangedStep. */
    protected emitStateChangedStep = createEventEmitter<
        Immutable<ViseurGameState>
    >();

    /**
     * Triggers when a state changes, but it is just one step in a large
     * number of changes.
     */
    public eventStateChangedStep = this.emitStateChangedStep.event;

    /** The event emitter for the timeUpdated. */
    protected emitTimeUpdated = createEventEmitter<Immutable<CurrentTime>>();

    /** Triggers when the timer ticks. */
    public eventTimeUpdated = this.emitTimeUpdated.event;

    /** The event emitter for the delayedReady. */
    protected emitDelayedReady = createEventEmitter();

    /** Triggers literally 1 second after the ready event. */
    public eventDelayedReady = this.emitDelayedReady.event;

    /** The event emitter for the ready. */
    protected emitReady = createEventEmitter<
        Readonly<{
            /** The game instance that is ready. */
            game: BaseGame;

            /** The gamelog thus far when ready. */
            gamelog: Immutable<GamelogWithReverses>;
        }>
    >();

    /**
     * Triggers when all async events are done and we are ready to being
     * normal operations.
     */
    public eventReady = this.emitReady.event;

    /** The event emitter for the gamelogIsRemote. */
    protected emitGamelogIsRemote = createEventEmitter<
        Immutable<{
            /** If the gamelog is remote, the url to get it from. */
            url?: string;
        }>
    >();

    /**
     * Triggered during loading of the gamelog if the gamelog is found at a
     * remote url.
     */
    public eventGamelogIsRemote = this.emitGamelogIsRemote.event;

    /** The event emitter for the gamelogLoaded. */
    protected emitGamelogLoaded = createEventEmitter<
        Immutable<GamelogWithReverses>
    >();

    /** Triggered when the gamelog has been loaded. */
    public eventGamelogLoaded = this.emitGamelogLoaded.event;

    /** The event emitter for the gamelogUpdated. */
    protected emitGamelogUpdated = createEventEmitter<
        Immutable<GamelogWithReverses>
    >();

    /**
     * Triggers when a steaming gamelog is updated in some way, probably a
     * new delta.
     */
    public eventGamelogUpdated = this.emitGamelogUpdated.event;

    /** The event emitter for the gamelogFinalized. */
    protected emitGamelogFinalized = createEventEmitter<
        Immutable<{
            /** The gamelog contents. */
            gamelog: GamelogWithReverses;

            /** A url to download the gamelog from the remote game server. */
            url: string;
        }>
    >();

    /**
     * Triggers when a streaming gamelog is finished streaming and will no
     * longer change.
     * In addition a url to the finalized gamelog (with other player's non
     * obfuscated data) will be emitted.
     */
    public eventGamelogFinalized = this.emitGamelogFinalized.event;

    // -- connection events -- \\

    /** The event emitter for the connectionConnected. */
    protected emitConnectionConnected = createEventEmitter();

    /**
     * Triggers when a connection event occurs and we have some message to
     * send.
     */
    public eventConnectionConnected = this.emitConnectionConnected.event;

    /** The event emitter for the connectionMessage. */
    protected emitConnectionMessage = createEventEmitter<string>();

    /**
     * Triggers when a connection event occurs and we have some message to
     * send.
     */
    public eventConnectionMessage = this.emitConnectionMessage.event;

    /** The event emitter for the connectionClosed. */
    protected emitConnectionClosed = createEventEmitter<
        Immutable<{
            /** If it closed due to a client (us) timeout. */
            timedOut: boolean;
        }>
    >();

    /**
     * Triggers when a connection that was opened is closed, including data
     * if it closed due to a timeout.
     */
    public eventConnectionClosed = this.emitConnectionClosed.event;

    /** The event emitter for the connectionError. */
    protected emitConnectionError = createEventEmitter<Error>();

    /**
     * Triggers when a connection encounters and error, and emits that error.
     */
    public eventConnectionError = this.emitConnectionError.event;
}
