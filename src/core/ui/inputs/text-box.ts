import { BaseInput, IBaseInputArgs } from "./base-input";

/** a text input for strings */
export class TextBox extends BaseInput {
    constructor(args: IBaseInputArgs & {
        /** the placeholder text */
        placeholder?: string,
    }) {
        super(Object.assign({
            type: "text",
        }, args));

        this.element.on("keypress", (e) => {
            if (e.which === 13) { // enter key
                this.emit("submitted", this.value);
            }
        });

        if (args.placeholder) {
            this.element.attr("placeholder", args.placeholder);
        }
    }
}
