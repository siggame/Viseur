import { BaseInput, IBaseInputArgs } from "../base-input";

export interface IButtonEvents {
    /** Triggered when the button is clicked */
    on(event: "clicked", listener: () => void): this;
}

/** A range input for numbers */
export class Button extends BaseInput implements IButtonEvents {
    constructor(args: IBaseInputArgs & {
        /** text string to place on the button */
        text?: string,
    }) {
        super(args);

        if (args.text) {
            this.setText(args.text);
        }

        this.element.on("click", () => {
            this.click();
        });
    }

    /**
     * Sets the text on this button
     * @param {string} str the text to display on the button
     */
    public setText(str: string): void {
        this.element.html(str);
    }

    /**
     * Force emit a 'clicked' event
     */
    public click(): void {
        if (!this.element.prop("disabled")) {
            this.emit("clicked");
        }
    }

    protected getTemplate(): Handlebars {
        return require("./button.hbs");
    }
}
