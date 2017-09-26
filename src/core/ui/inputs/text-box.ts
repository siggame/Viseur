import { Event, events } from "ts-typed-events";
import { BaseInput, IBaseInputArgs } from "./base-input";

/** a text input for strings */
export class TextBox extends BaseInput<string> {
    /** Events this class emits */
    public readonly events = events.concat(super.events || (this as any).events, {
        /** Emitted when this text-box is submitted (enter pressed) */
        submitted: new Event<string>(),
    });

    /**
     * Creates a text box for text input
     * @param args has an optional placeholder text added to base input args
     */
    constructor(args: IBaseInputArgs & {
        /** the placeholder text */
        placeholder?: string,
    }) {
        super(Object.assign({
            type: "text",
            value: "",
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
