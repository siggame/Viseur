import { Gamelog } from "@cadre/ts-utils/cadre";
import { Timer } from "src/core/timer";
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur/";
import { createEventEmitter } from "ts-typed-events";
import { ViseurGamelog } from "./game";

/** Simple container for the current time of the time manager. */
export interface CurrentTime {
    /** The current index. */
    index: number;

    /** The current dt between the index and the next. */
    dt: number;
}

/** Manages playback time and what the game state to show should look like. */
export class TimeManager {
    /** The emitter for the NewIndex event. */
    private emitNewIndex = createEventEmitter<number>();

    /** Triggered when the current index changes. */
    public eventNewIndex = this.emitNewIndex.event;

    /** The emitter for the Playing event. */
    private emitPlaying = createEventEmitter();

    /** Triggered when we starting ticking (playing). */
    public eventPlaying = this.emitPlaying.event;

    /** The emitter for the Paused event. */
    private emitPaused = createEventEmitter();

    /** Triggered when we stop ticking (pause). */
    public eventPaused = this.emitPaused.event;

    /** The emitter for tentEnded event. */
    private emitEnded = createEventEmitter();

    /**
     * Triggered when we reach the end of the indexes we can iterate
     * through.
     */
    public eventEnded = this.emitEnded.event;

    /** The current index  to render. */
    private currentIndex = -1;

    /** The gamelog we are counting deltas for. */
    private gamelog: Immutable<ViseurGamelog> | undefined;

    /** The timer we use to count up or down the index. */
    private readonly timer: Timer;

    /**
     * Creates the time manager.
     *
     * @param viseur - The Viseur instance this is managing time for.
     */
    constructor(private readonly viseur: Viseur) {
        this.timer = new Timer(viseur.settings.playbackSpeed.get());

        this.timer.eventFinished.on(() => {
            this.ticked();
        });

        viseur.settings.playbackSpeed.changed.on((newSpeed) => {
            this.timer.setSpeed(newSpeed);
        });

        viseur.eventReady.on(({ gamelog }) => {
            this.ready(gamelog);
        });
    }

    /**
     * Returns the current time. Calling this does not effect the timer.
     *
     * @returns Contains the current `index` and `dt`.
     */
    public getCurrentTime(): CurrentTime {
        return {
            index: this.currentIndex,
            dt: this.timer.getProgress(),
        };
    }

    /**
     * Sets the current time to some index and dt.
     *
     * @param index - The current index, must be between [0, deltas.length].
     * @param dt - The "tweening" between index and index + 1, must be
     * between [0, 1).
     */
    public setTime(index: number, dt = 0): void {
        const oldIndex = this.currentIndex;
        this.currentIndex = index;
        this.timer.setProgress(dt);

        if (oldIndex !== index) {
            this.emitNewIndex(index);
        }
    }

    /**
     * Force plays the next animation.
     *
     * @param [index] - The index to play at.
     * @param [dt] - The dt to play at.
     */
    public play(index?: number, dt?: number): void {
        if (index !== undefined) {
            this.setTime(index, dt);
        }

        if (!this.timer.isTicking()) {
            this.playPause();
        }
    }

    /**
     * Invoked when Viseur is ready.
     *
     * @param gamelog - The gamelog, may be streaming.
     */
    private ready(gamelog: Immutable<Gamelog>): void {
        this.gamelog = gamelog;

        this.ticked(true);

        this.viseur.gui.eventPlayPause.on(() => {
            this.playPause();
        });

        this.viseur.gui.eventNext.on(() => {
            this.next();
        });

        this.viseur.gui.eventBack.on(() => {
            this.back();
        });

        this.viseur.gui.eventPlaybackSlide.on((value) => {
            const index = Math.floor(value);
            const dt = value - index;
            const current = this.getCurrentTime();
            if (Math.abs(value - current.index - current.dt) > 0.1) {
                // the change in time was too great, they probably clicked far away
                this.setTime(index, dt);
            }
        });

        this.viseur.eventGamelogUpdated.on((updated) => {
            if (this.currentIndex < updated.deltas.length) {
                this.play();
            }
        });
    }

    /**
     * If playing pause, if paused start playing.
     */
    private playPause(): void {
        if (
            !this.timer.isTicking() &&
            this.gamelog &&
            this.currentIndex === this.gamelog.deltas.length - 1 &&
            this.timer.getProgress() > 0.99
        ) {
            // then wrap around to the start
            this.setTime(0, 0);
        }

        const paused = this.timer.invertTicking();
        if (paused) {
            this.emitPaused();
        } else {
            this.emitPlaying();
        }
    }

    /**
     * Invoked when the timer ticks, advancing the index by 1, and resetting dt to 0.
     *
     * @param [start] - True if the tick is from the start of rendering, e.g. Viseur is ready, false otherwise.
     */
    private ticked(start?: boolean): void {
        this.currentIndex += start ? 0 : 1;

        if (!this.gamelog) {
            throw new Error(`No gamelog when ticked!`);
        }

        // check if we need to pause and go back a very small amount
        const backPause =
            this.gamelog.streaming &&
            this.currentIndex === this.gamelog.deltas.length;

        if (!backPause) {
            this.emitNewIndex(this.currentIndex);
        } else {
            // stop, we hit the end
            this.pause(this.currentIndex - 1, 0.9999);

            return;
        }

        if (!start) {
            if (this.currentIndex < this.gamelog.deltas.length) {
                this.timer.restart();
            } else {
                this.pause(this.currentIndex, 0);
                this.emitEnded();
            }
        }
    }

    /**
     * Sets the timer back. If playing pauses and reduces dt to 0, otherwise advances 1 index.
     */
    private back(): void {
        let index = this.currentIndex;
        if (this.timer.getProgress() === 0) {
            index--;
        }

        this.pause(index, 0);
    }

    /**
     * Advances to the next index, and pauses the timer.
     */
    private next(): void {
        let index = this.currentIndex;
        if (this.timer.getProgress() === 0) {
            index++;
        }

        this.pause(index, 0);
    }

    /**
     * Pauses the timer. Doe not call to pause as in a play/pause.
     *
     * @param [index] - The index to pause the time to.
     * @param [dt] - The dt to pause the time to.
     */
    private pause(index?: number, dt?: number): void {
        this.timer.pause();

        if (index !== undefined) {
            this.setTime(index, dt);
        }

        this.emitPaused();
    }
}
