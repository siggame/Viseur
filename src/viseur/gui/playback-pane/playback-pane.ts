import { Event, events } from "src/core/event";
import { BaseElement, IBaseElementArgs } from "src/core/ui/base-element";
import { DisableableElement } from "src/core/ui/disableable-element";
import * as inputs from "src/core/ui/inputs";
import { viseur } from "src/viseur";
import { IGamelog } from "src/viseur/game/gamelog";
import { KEYS } from "../keys";
import "./playback-pane.scss";

/**
 * handles all the playback controls and logic for the GUI
 */
export class PlaybackPane extends BaseElement {
    /** All the events this class emits */
    public readonly events = events({
        /** Emitted when the playback slider is slid */
        playbackSlide: new Event<number>(),

        /** Emitted when fullscreen is toggled */
        toggleFullscreen: new Event(),

        /** Emitted when we want to go to the next state */
        next: new Event(),

        /** Emitted when we want to go to the previous state */
        back: new Event(),

        /** Emitted when we want play or pause (toggled) */
        playPause: new Event(),
    });

    /** The number of deltas in the gamelog */
    private numberOfDeltas: number;

    /** If all the inputs are disabled */
    private disabled: boolean = false;

    /** element displaying the current playback time */
    private readonly playbackTimeCurrentElement: JQuery<HTMLElement>;

    /** element displaying the max playback time */
    private readonly playbackTimeMaxElement: JQuery<HTMLElement>;

    /** the top container for buttons */
    private readonly topContainerElement: JQuery<HTMLElement>;

    /** the bottom left container for buttons */
    private readonly bottomLeftContainerElement: JQuery<HTMLElement>;

    /** the bottom right container for buttons */
    private readonly bottomRightContainerElement: JQuery<HTMLElement>;

    /** Handy collection of all our inputs */
    private readonly inputs: DisableableElement[];

    // Our Inputs \\

    /** The Element */
    private readonly playbackSlider: inputs.Slider;

    /** The Element */
    private readonly playPauseButton: inputs.Button;

    /** The Element */
    private readonly backButton: inputs.Button;

    /** The Element */
    private readonly nextButton: inputs.Button;

    /** The Element */
    private readonly deltasButton: inputs.Button;

    /** The Element */
    private readonly turnsButton: inputs.Button;

    /** The Element */
    private readonly speedSlider: inputs.Slider;

    /** The Element */
    private readonly fullscreenButton: inputs.Button;

    constructor(args: IBaseElementArgs) {
        super(args);

        this.element.addClass("collapsed");

        this.playbackTimeCurrentElement = this.element.find(".playback-time-current");
        this.playbackTimeMaxElement = this.element.find(".playback-time-max");

        this.topContainerElement = this.element.find(".playback-pane-top"),
        this.bottomLeftContainerElement = this.element.find(".playback-pane-bottom-left"),
        this.bottomRightContainerElement = this.element.find(".playback-pane-bottom-right"),

        this.playbackSlider = new inputs.Slider({
            id: "playback-slider",
            parent: this.topContainerElement,
        });
        this.playbackSlider.events.changed.on((value) => {
            this.events.playbackSlide.emit(value);
        });

        // play or pause \\
        this.playPauseButton = new inputs.Button({
            id: "play-pause-button",
            parent: this.bottomLeftContainerElement,
        });
        this.playPauseButton.events.clicked.on(() => {
            this.events.playPause.emit(undefined);
        });

        KEYS.space.up.on(() => { // space bar up, hence the ' => '
            this.playPauseButton.click();
        });

        // back \\
        this.backButton = new inputs.Button({
            id: "back-button",
            parent: this.bottomLeftContainerElement,
        });
        this.backButton.events.clicked.on(() => {
            this.events.back.emit(undefined);
        });
        KEYS.leftArrow.up.on(() => {
            this.backButton.click();
        });

        // next \\
        this.nextButton = new inputs.Button({
            id: "next-button",
            parent: this.bottomLeftContainerElement,
        });
        this.nextButton.events.clicked.on(() => {
            this.events.next.emit(undefined);
        });
        KEYS.rightArrow.up.on(() => {
            this.nextButton.click();
        });

        // deltas and turns mode \\
        this.deltasButton = new inputs.Button({
            id: "deltas-button",
            parent: this.bottomRightContainerElement,
        });
        this.deltasButton.events.clicked.on(() => {
            if (viseur.settings.playbackMode.get() !== "deltas") {
                viseur.settings.playbackMode.set("deltas");
            }
        });
        this.turnsButton = new inputs.Button({
            id: "turns-button",
            parent: this.bottomRightContainerElement,
        });
        this.turnsButton.events.clicked.on(() => {
            if (viseur.settings.playbackMode.get() !== "turns") {
                viseur.settings.playbackMode.set("turns");
            }
        });

        // speed \\
        this.speedSlider = new inputs.Slider({
            id: "speed-slider",
            parent: this.bottomRightContainerElement,
            min: 0,
            max: 0.98,
            value: this.getSliderFromSpeed(),
        });

        this.updateSpeedSlider();
        this.speedSlider.events.changed.on((value) => {
            this.updateSpeedSetting();
        });
        viseur.settings.playbackSpeed.changed.on((value) => {
            this.updateSpeedSlider();
        });

        this.fullscreenButton = new inputs.Button({
            id: "fullscreen-button",
            parent: this.bottomRightContainerElement,
        });
        this.fullscreenButton.events.clicked.on(() => {
            this.events.toggleFullscreen.emit(undefined);
        });

        this.inputs = [
            this.playbackSlider,
            this.playPauseButton,
            this.backButton,
            this.nextButton,
            this.deltasButton,
            this.turnsButton,
            this.speedSlider,
            this.fullscreenButton,
        ];

        this.disable();

        viseur.events.ready.once((data) => {
            this.viseurReady(data.gamelog);
        });

        viseur.events.gamelogUpdated.on((gamelog: IGamelog) => {
            this.updatePlaybackSlider(gamelog);
        });

        viseur.events.gamelogFinalized.on(() => {
            this.enable();
        });

        viseur.timeManager.events.playing.on(() => {
            this.element.addClass("playing");
        });

        viseur.timeManager.events.paused.on(() => {
            this.element.removeClass("playing");
        });

        viseur.events.timeUpdated.on((data) => {
            this.timeUpdated(data.index, data.dt);
        });

        viseur.settings.playbackMode.changed.on((value) => {
            this.updatePlaybackMode(String(value));
        });

        this.updatePlaybackMode(viseur.settings.playbackMode.get());
    }

    protected getTemplate(): Handlebars {
        return require("./playback-pane.hbs");
    }

    /**
     * Invoked when the gamelog is loaded
     *
     * @private
     * @param {Object} gamelog - the gamelog that was loaded
     */
    private viseurReady(gamelog: IGamelog): void {
        this.numberOfDeltas = gamelog.deltas.length;

        if (!gamelog.streaming) {
            this.enable();
        }
        else {
            this.speedSlider.enable(); // while streaming the gamelog only enable the speed slider
            viseur.events.gamelogFinalized.on((data) => {
                this.numberOfDeltas = data.gamelog.deltas.length;
            });
        }

        this.playbackSlider.value = 0;
        this.updatePlaybackSlider(gamelog);

        this.element.removeClass("collapsed");
    }

    /**
     * Invoked when the gamelog's number of deltas is known or changes
     * @param {Object} gamelog - the gamelog to get info from
     */
    private updatePlaybackSlider(gamelog: IGamelog): void {
        this.playbackSlider.setMax(gamelog.deltas.length - 1 / 1e10); // basically round down a bit

        this.playbackTimeMaxElement.html(String(gamelog.deltas.length - 1));
    }

    /**
     * disables the playback mode of mode not enabled
     * @param mode the current mode we are in
     */
    private updatePlaybackMode(mode: string): void {
        mode = mode.toLowerCase();
        this.turnsButton.element.toggleClass("active", mode === "turns");
        this.deltasButton.element.toggleClass("active", mode === "deltas");
    }

    /**
     * Invoked when the TimeManager's time changes, so we can update the slider and buttons
     * @param {number} index - the index that was updated to
     * @param {number} dt - the dt number [0, 1) that was updated
     */
    private timeUpdated(index: number, dt: number): void {
        this.playbackTimeCurrentElement.html(String(index));
        if (this.playbackSlider.value !== index + dt) {
            this.playbackSlider.value = index + dt;
        }

        if (this.isEnabled()) {
            if (index === 0 && dt === 0) {
                this.backButton.disable();
            }
            else {
                this.backButton.enable();
            }

            if (index >= (this.numberOfDeltas - 1)) {
                this.nextButton.disable();
            }
            else {
                this.nextButton.enable();
            }
        }
    }

    /**
     * Converts from the speed slider's value to the actual speed for the TimeManager
     * @returns {number}  the TimeMangers speed based on the slider value x
     */
    private getSpeedFromSlider(): number {
        return Math.round(1000 * (1 - this.speedSlider.value));
    }

    /**
     * Converts from the speed of the TimeManager to the slider's value (reverse of y)
     * @returns the speedSlider's value to represent y
     */
    private getSliderFromSpeed(): number {
        return 1 - (viseur.settings.playbackSpeed.get() / 1000);
    }

    /**
     * Invoked when the speedSlider is dragged/changed.
     */
    private updateSpeedSetting(): void {
        viseur.settings.playbackSpeed.set(this.getSpeedFromSlider());
    }

    /**
     * Invoked when the playback-speed setting is changed, so we can update the slider
     * @param {number} value - the new speed value set to the SettingManager,
     *                         we will update the speedSlider according to it
     */
    private updateSpeedSlider(): void {
        this.speedSlider.value = this.getSliderFromSpeed();
    }

    /**
     * Enables all the inputs
     */
    private enable(): void {
        this.disabled = false;
        for (const input of this.inputs) {
            input.enable();
        }
    }

    /**
     * Disables all the inputs
     */
    private disable(): void {
        this.disabled = true;
        for (const input of this.inputs) {
            input.disable();
        }
    }

    /**
     * Checks if the playback pane is enabled (playback can be manipulated).
     * It should be disabled during streaming gamelogs
     * @returns {Boolean} true if enabled, false otherwise
     */
    private isEnabled(): boolean {
        return !this.disabled;
    }
}
