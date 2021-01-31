import { KEY_NAME_TO_CODE } from "src/core/key-codes";
import { Immutable } from "src/utils";
import { createEventEmitter } from "ts-typed-events";
import { BaseInput, BaseInputArgs } from "./base-input";

/** A text input for strings.*/
export class TextBox extends BaseInput<string> {
    /** Emitter for submitted event. */
    private readonly emitSubmitted = createEventEmitter<string>();

    /** Emitted when this text-box is submitted (enter pressed). */
    public readonly eventSubmitted = this.emitSubmitted.event;

    /**
     * Creates a text box for text input.
     *
     * @param args - Has an optional placeholder text added to base input args.
     */
    constructor(
        args: Immutable<BaseInputArgs<string>> & {
            /** The placeholder text. */
            placeholder?: string;
        },
    ) {
        super({
            type: "text",
            value: "",
            ...args,
        });

        this.element.on("keypress", (e) => {
            if (e.which === KEY_NAME_TO_CODE.enter) {
                this.emitSubmitted(this.value);
            }
        });

        if (args.placeholder) {
            this.element.attr("placeholder", args.placeholder);
        }
    }
}
