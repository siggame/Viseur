import { clamp } from "lodash";
import { Event, events } from "ts-typed-events";

/** Ticks at a custom rate to a number of steps. */
export class Timer {
    /** Events this class emits */
    public readonly events = events({
        /** Emitted when this timer finishes ticking */
        finished: new Event(),
    });

    /** Last timer progress before being paused */
    private lastProgress: number = 0;

    /** The last time (epoch) that this ticked */
    private lastTime: number = 0;

    /** The last tick callback */
    private timeout?: number;

    /** The speed at which we tick (in ms) */
    private speed: number = 1;

    /**
     * Creates a timer at some initial speed.
     *
     * @param speed The initial speed to set to, can be changed later.
     */
    constructor(speed?: number) {
        this.setSpeed(Number(speed) || 1000);
    }

    /**
     * Sets the ticking speed of the timer, in ms.
     *
     * @param speed - The speed to tick at, in ms. Current speed will be recalculated.
     */
    public setSpeed(speed: number): void {
        const wasTicking = this.isTicking();

        if (wasTicking) {
            this.pause();
        }

        // Ensure the time is set to at least 1ms,
        // any lower and it's too fine for js to handle reliably
        this.speed = Math.max(Number(speed) || 0, 1);
        if (wasTicking) {
            this.tick();
        }
    }

    /**
     * Sets the progress (how far it is to finishing).
     *
     * @param time - Must be between [0, 1], with 0 being no progress at all, 0.5 being half, etc.
     */
    public setProgress(time: number): void {
        const wasTicking = this.isTicking();
        if (wasTicking) {
            this.pause();
        }

        this.lastProgress = clamp(time, 0, 1);

        if (wasTicking) {
            this.tick();
        }
    }

    /**
     * Restarts the timer, resetting progress to 0 then starting it back up.
     *
     * @returns true if started ticking, false if already ticking so this did
     * nothing.
     */
    public restart(): boolean {
        this.setProgress(0);

        return this.tick();
    }

    /**
     * Starts ticking, taking saved progress into account.
     *
     * @returns true if started ticking, false if already ticking so this did nothing.
     */
    public tick(): boolean {
        if (this.timeout || this.lastProgress >= 1) {
            return false;
        }

        this.lastTime = new Date().getTime();
        const nextTickMs = (1 - this.getProgress()) * this.speed;
        this.timeout = window.setTimeout(() => {
            this.pause();
            this.events.finished.emit();
        }, nextTickMs);

        return true;
    }

    /**
     * Checks if this timer is already ticking.
     *
     * @returns true if ticking, false otherwise.
     */
    public isTicking(): boolean {
        return this.timeout !== undefined;
    }

    /**
     * Pauses the timer.
     *
     * @returns True if the timer was paused, false if it was not paused because it was not playing.
     */
    public pause(): boolean {
        if (this.timeout === undefined) {
            return false; // we are not ticking
        }

        clearTimeout(this.timeout);

        this.lastProgress = this.getProgress();
        this.timeout = undefined;

        return true;
    }

    /**
     * Gets how far this is into it's time, will be between [0, 1].
     *
     * @returns The current progress, a number between [0, 1].
     */
    public getProgress(): number {
        if (!this.isTicking()) {
            return this.lastProgress;
        }

        // otherwise we need to calculate it
        const nowTime = new Date().getTime();
        const timeDiff = nowTime - this.lastTime;
        const percentDone = timeDiff / this.speed;

        return Math.min(this.lastProgress + percentDone, 1);
    }

    /**
     * Starts ticking if paused, pauses if ticking.
     *
     * @returns True if now paused, false otherwise.
     */
    public invertTicking(): boolean {
        if (this.isTicking()) {
            this.pause();

            return true; // as we are not paused
        }
        else {
            this.tick();

            return false; // as we are now running
        }
    }

    /**
     * Checks if the timer is done (progress is 1).
     *
     * @returns True if done progressing, false otherwise.
     */
    public isDone(): boolean {
        return this.lastProgress === 1;
    }
}
