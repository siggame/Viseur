import { Immutable } from "@cadre/ts-utils";
import * as $ from "jquery";
import { BaseElement, BaseElementArgs } from "src/core/ui/base-element";
import { Tabular } from "src/core/ui/tabular";
import { Viseur } from "src/viseur";
import { createEventEmitter } from "ts-typed-events";
import { GUI } from "../gui";
import * as infoPaneHbs from "./info-pane.hbs";
import "./info-pane.scss";
import { TABS } from "./tabs";

const $document = $(document); // cache it

/** Valid orientations to be. */
type Orientation = "horizontal" | "vertical";

/** Valid sides to dock on. */
type Side = "top" | "left" | "bottom" | "right";

/** The only valid sides to check against at run time. */
const VALID_SIDES = ["top", "left", "bottom", "right"];

/** The dock-able pane that has tabs and info about the Visualizer. */
export class InfoPane extends BaseElement {
    /** Emitter for when this is resized event. */
    private readonly emitResized = createEventEmitter<
        Immutable<{
            /** The new width we resized to. */
            width: number;

            /** The new height we resized to. */
            height: number;
        }>
    >();

    /** Emitted when this is resized (may still be resizing). */
    public readonly eventResized = this.emitResized.event;

    /** Emitter for when this a resize starts. */
    private readonly emitResizeStart = createEventEmitter();

    /** Emitted when this starts resizing. */
    public readonly eventResizeStart = this.emitResizeStart.event;

    /** Emitter for when this a resize stops. */
    private readonly emitResizeEnd = createEventEmitter();

    /** Emitted when this ends resizing. */
    public readonly eventResizeEnd = this.emitResizeEnd.event;

    /** The GUI this InfoPane is a part of. */
    private readonly gui: GUI;

    /** The tabular that switches tabs on this info pane. */
    private readonly tabular: Tabular;

    /** The main content container. */
    private readonly contentElement: JQuery;

    /** The element for the re-sizer bar. */
    private readonly resizerElement: JQuery;

    /** The current length of the info pane. */
    private length = 0;

    /** The minimum length of the info pane when it is being resized. */
    private readonly minimumLength = 200;

    /** The current orientation of the info pane. */
    private orientation: Orientation = "vertical";

    /** The current side the info pane is on. */
    private side: Side = "right";

    /** The Viseur instance controlling us. */
    private readonly viseur: Viseur;

    /**
     * Creates an info pane.
     *
     * @param args - Initialization arguments.
     */
    constructor(
        args: Readonly<
            BaseElementArgs & {
                /** The GUI instance we are inside of. */
                gui: GUI;

                /** The Viseur instance we are a part of. */
                viseur: Viseur;
            }
        >,
    ) {
        super(args, infoPaneHbs);

        this.viseur = args.viseur;
        this.gui = args.gui;

        this.resizerElement = this.element.find(".info-pane-resizer");
        this.contentElement = this.element.find(".info-pane-content");

        this.snapTo(this.viseur.settings.infoPaneSide.get());
        this.resize(this.viseur.settings.infoPaneLength.get());

        this.resizerElement.on("mousedown", (downEvent) => {
            this.onResize(downEvent);
        });

        this.viseur.settings.infoPaneSide.changed.on((side: string) => {
            this.snapTo(side);
        });

        this.viseur.settings.infoPaneLength.changed.on((length: number) => {
            this.resize(length);
        });

        this.tabular = new Tabular({
            id: "info-pane-tabular",
            parent: this.contentElement,
        });

        this.tabular.attachTabs(
            TABS.map(
                (TabClass) =>
                    new TabClass({
                        tabular: this.tabular,
                        viseur: this.viseur,
                    }),
            ),
        );
    }

    /**
     * Resizes the info pane based on position and length.
     *
     * @param newLength - The new length (in pixels) of this info pane.
     * If omitted the old length is used.
     * Value cannot be less than minimumLength.
     */
    public resize(newLength?: number): void {
        this.element.addClass("resizing");
        if (newLength) {
            this.length = Math.max(newLength, this.minimumLength);
            if (this.viseur.settings.infoPaneLength.get() !== newLength) {
                this.viseur.settings.infoPaneLength.set(this.length);
            }
        }

        if (this.orientation === "horizontal") {
            this.element.height(this.length).css("width", "");
        } else {
            this.element.width(this.length).css("height", "");
        }

        let width = this.element.width() || 0;
        let height = this.element.height() || 0;

        if (this.gui.isFullscreen()) {
            width = 0;
            height = 0;
        }

        this.emitResized({ width, height });
        this.element.removeClass("resizing");
    }

    /**
     * Gets the current orientation.
     *
     * @returns The current orientation.
     */
    public getOrientation(): Orientation {
        return this.orientation;
    }

    /**
     * Gets the current side.
     *
     * @returns The current side.
     */
    public getSide(): Side {
        return this.side;
    }

    /**
     * Snaps to a new side of the screen.
     *
     * @param side - The side to snap to, must be 'top', 'left', 'bottom', or 'right'.
     */
    private snapTo(side: string): void {
        const validSide = side.toLowerCase() as Side; // untrue until after the below check.

        if (VALID_SIDES.indexOf(validSide) === -1) {
            throw new Error(`invalid side to snap to: '${side}'`);
        }

        for (const s of VALID_SIDES) {
            this.element.toggleClass(`snap-${s}`, validSide === s);
        }

        if (side === "top" || side === "left") {
            this.contentElement.after(this.resizerElement);
        } else {
            this.contentElement.before(this.resizerElement);
        }

        this.side = validSide;
        this.orientation =
            side === "left" || side === "right" ? "vertical" : "horizontal";

        this.resize();
    }

    /**
     * Invoked when the user is dragging to resize this.
     *
     * @param downEvent - The event generated from dragging the info pane.
     */
    private onResize(downEvent: JQuery.Event): void {
        let x = downEvent.pageX || 0;
        let y = downEvent.pageY || 0;
        let width = Number(this.element.width());
        let height = Number(this.element.height());

        $document // cached at the top of this file
            .on("mousemove", (moveEvent) => {
                this.emitResizeStart();

                const oldX = x;
                const oldY = y;

                x = moveEvent.pageX;
                y = moveEvent.pageY;

                this.element.addClass("resizing");
                if (this.orientation === "horizontal") {
                    let dy = oldY - y;
                    if (this.side === "top") {
                        dy = -dy;
                    }

                    if (dy !== 0) {
                        height += dy;
                        this.resize(height);
                    }
                } else {
                    let dx = oldX - x;
                    if (this.side === "left") {
                        dx = -dx;
                    }

                    if (dx !== 0) {
                        width += dx;
                        this.resize(width);
                    }
                }
            })
            .on("mouseup", () => {
                this.element.removeClass("resizing");
                this.emitResizeEnd();
                $document.off("mousemove mouseup");
            });
    }
}
