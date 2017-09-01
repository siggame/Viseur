import { Event, events } from "src/core/event";
import { BaseInput, IBaseInputArgs } from "./base-input";

/** a text input for strings */
export class TextBox extends BaseInput {
    /** Events this class emits */
    public readonly events = events({
        /** Emitted when this input's value changes */
        changed: new Event<string>(),

        /** Emitted when this text-box is submitted (enter pressed) */
        submitted: new Event<string>(),
    });

    constructor(args: IBaseInputArgs & {
        /** the placeholder text */
        placeholder?: string,
    }) {
        super(Object.assign({
            type: "text",
        }, args));

        this.element.on("keypress", (e) => {
            if (e.which === 13) { // enter key
                this.events.submitted.emit(this.value);
            }
        });

        if (args.placeholder) {
            this.element.attr("placeholder", args.placeholder);
        }
    }
}
