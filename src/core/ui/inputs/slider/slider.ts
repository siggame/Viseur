import { NumberInput, NumberInputArgs } from "../number";

/** A range input for numbers. */
export class Slider extends NumberInput {
    /**
     * Creates a slider.
     *
     * @param args - The args for the slider.
     */
    constructor(args: Readonly<NumberInputArgs>) {
        super({
            type: "range",
            step: "any",
            ...args,
        });

        const oldVal = this.value;
        this.value = oldVal; // re-sets, which causes the setter to clamp.
    }

    /**
     * Gets the string used to listen to the element for events.
     *
     * @returns The string for jquery to use.
     */
    protected getElementOnEventString(): string {
        return "input";
    }
}
