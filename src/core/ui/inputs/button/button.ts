import { Immutable } from "src/utils";
import { createEventEmitter } from "ts-typed-events";
import {
    DisableableElement,
    DisableableElementArgs,
} from "../../disableable-element";
import * as buttonHbs from "./button.hbs";

/** A range input for numbers. */
export class Button extends DisableableElement {
    /** Emitter for submitted event. */
    private readonly emitClicked = createEventEmitter();

    /** Emitted when this button is clicked. */
    public readonly eventClicked = this.emitClicked.event;

    /**
     * Creates a new Button.
     *
     * @param args - Button construction args. Can include text for the button.
     */
    constructor(
        args: Immutable<
            DisableableElementArgs & {
                /** Text string to place on the button. */
                text?: string;
            }
        >,
    ) {
        super(args, buttonHbs);

        if (args.text) {
            this.setText(args.text);
        }

        this.element.on("click", () => {
            this.click();
        });
    }

    /** Disables this input. */
    public disable(): void {
        this.element.prop("disabled", true);
    }

    /** Enables this input. */
    public enable(): void {
        this.element.prop("disabled", false);
    }

    /**
     * Sets the text on this button.
     *
     * @param str - The text to display on the button.
     */
    public setText(str: string): void {
        this.element.html(str);
    }

    /** Force emit a 'clicked' event. */
    public click(): void {
        if (!this.element.prop("disabled")) {
            this.emitClicked();
        }
    }
}
