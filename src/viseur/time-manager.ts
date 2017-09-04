import { Event } from "src/core/event";
import { Timer } from "src/core/timer";
import { viseur } from "src/viseur/";
import { BaseGame } from "./game/base-game";
import { IGamelog } from "./game/gamelog";

/** Simple container for the current time of the time manager */
export interface ICurrentTime {
    /** The current index */
    index: number;

    /** The current dt between the index and the next */
    dt: number;
}

/* tslint:enable:unified-signatures */

/** Manages playback time and what the game state to show should look like */
export class TimeManager {
    /** Events this class emits */
    public readonly events = Object.freeze({
        /** Triggered when the current index changes */
        newIndex: new Event<number>(),

        /** Triggered when we starting ticking (playing) */
        playing: new Event(),

        /** Triggered when we stop ticking (pause) */
        paused: new Event(),

        /** Triggered when we reach the end of the indexes we can iterate through */
        ended: new Event(),
    });

    /** The current index  to render */
    private currentIndex: number = -1;

    /** The game we are managing time for */
    private game: BaseGame;

    /** The gamelog we are counting deltas for */
    private gamelog: IGamelog;

    /** The timer we use to count up or down the index */
    private readonly timer: Timer;

    /** Creates the time manager  */
    constructor() {
        this.timer = new Timer(viseur.settings.playbackSpeed.get(1000));

        this.timer.events.finished.on(() => {
            this.ticked();
        });

        viseur.settings.playbackSpeed.changed.on((newSpeed) => {
            this.timer.setSpeed(newSpeed);
        });

        viseur.events.ready.on((data) => {
            this.ready(data.game, data.gamelog);
        });
    }

    /**
     * Returns the current time. Calling this does not effect the timer.
     * @returns {Object} contains the current `index` and `dt`.
     */
    public getCurrentTime(): ICurrentTime {
        return {
            index: this.currentIndex,
            dt: this.timer.getProgress(),
        };
    }

    /**
     * Sets the current time to some index and dt
     * @param {number} index the current index, must be between [0, deltas.length]
     * @param {number} [dt=0] the "tweening" between index and index + 1, must be between [0, 1)
     */
    public setTime(index: number, dt?: number): void {
        const oldIndex = this.currentIndex;
        this.currentIndex = index;
        this.timer.setProgress(dt || 0);

        if (oldIndex !== index) {
            this.events.newIndex.emit(index);
        }
    }

    /**
     * force plays the next animation
     *
     * @param {number} [index] the index to play at
     * @param {number} [dt] the dt to play at
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
     * Invoked when Viseur is ready
     * @param {BaseGame} game - the game we are playing back
     * @param {Object} gamelog - the gamelog, may be streaming
     */
    private ready(game: BaseGame, gamelog: IGamelog): void {
        this.game = game;
        this.gamelog = gamelog;

        this.ticked(true);

        viseur.gui.events.playPause.on(() => {
            this.playPause();
        });

        viseur.gui.events.next.on(() => {
            this.next();
        });

        viseur.gui.events.back.on(() => {
            this.back();
        });

        viseur.gui.events.playbackSlide.on((value) => {
            const index = Math.floor(value);
            const dt = value - index;
            const current = this.getCurrentTime();
            if (this.timer.isTicking() && Math.abs(value - current.index - current.dt) > 0.10) {
                // the change in time was too great, they probably clicked far away
                this.pause(index, dt);
            }
        });

        viseur.events.gamelogUpdated.on(() => {
            if (this.currentIndex < this.gamelog.deltas.length) {
                this.play();
            }
        });
    }

    /**
     * if playing pause, if paused start playing
     */
    private playPause(): void {
        if (!this.timer.isTicking()
          && this.currentIndex === this.gamelog.deltas.length - 1
          && this.timer.getProgress() > 0.99
        ) { // then wrap around to the start
            this.setTime(0, 0);
        }

        const paused = this.timer.invertTicking();
        (paused
            ? this.events.paused
            : this.events.playing
        ).emit(undefined);
    }

    /**
     * Invoked when the timer ticks, advancing the index by 1, and resetting dt to 0
     * @param {boolean} [start] - true if the tick is from the start of rendering, e.g. Viseur is ready, false otherwise
     */
    private ticked(start?: boolean): void {
        this.currentIndex += (start ? 0 : 1);

        // check if we need to pause and go back a very small amount
        const backPause = (this.gamelog.streaming && this.currentIndex === this.gamelog.deltas.length - 1);

        if (!backPause) {
            this.events.newIndex.emit(this.currentIndex);
        }
        else {
            // stop, we hit the end
            this.pause(this.currentIndex - 1, 0.9999);
            return;
        }

        if (!start) {
            if (this.currentIndex < this.gamelog.deltas.length) {
                this.timer.restart();
            }
            else {
                this.pause(this.currentIndex, 0);
                this.events.ended.emit(undefined);
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
     *
     * @private
     */
    private next(): void {
        let index = this.currentIndex;
        if (this.timer.getProgress() === 0) {
            index++;
        }

        this.pause(index, 0);
    }

    /**
     * Pauses the timer. Doe not call to pause as in a play/pause
     *
     * @private
     * @param {number} [index] - the index to pause the time to
     * @param {number} [dt] - the dt to pause the time to
     */
    private pause(index?: number, dt?: number): void {
        this.timer.pause();

        if (index !== undefined) {
            this.setTime(index, dt);
        }

        this.events.paused.emit(undefined);
    }
}
