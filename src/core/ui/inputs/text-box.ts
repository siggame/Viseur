import { Event } from "src/core/event";
import { BaseInput, IBaseInputArgs } from "./base-input";

/** a text input for strings */
export class TextBox extends BaseInput<string> {
    /** Events this class emits */
    public readonly events = Event.proxy(super.events, {
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
