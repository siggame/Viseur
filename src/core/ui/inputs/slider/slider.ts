import { INumberInputArgs, NumberInput } from "../number";

/** A range input for numbers */
export class Slider extends NumberInput {
    /**
     * Creates a slider
     * @param args the args for the slider
     */
    constructor(args: Readonly<INumberInputArgs>) {
        super({
            type: "range",
            step: "any",
            ...args,
        });

        // this is goody but it re-sets the value
        // when done in the base constructor above the slider resets when the
        // step value is changed, so we need to reset it after those are set
        this.value = this.value;
    }

    /**
     * Gets the string used to listen to the element for events
     * @returns the string for jquery to use
     */
    protected getElementOnEventString(): string {
        return "input";
    }
}
