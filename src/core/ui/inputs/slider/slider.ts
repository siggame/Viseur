import { INumberInputArgs, NumberInput } from "../number";

/** A range input for numbers */
export class Slider extends NumberInput {
    /**
     * Creates a slider
     * @param args the args for the slider
     */
    constructor(args: INumberInputArgs) {
        super(Object.assign({
            type: "range",
            step: "any",
        }, args));
    }

    /**
     * Gets the string used to listen to the element for events
     * @returns the string for jquery to use
     */
    protected getElementOnEventString(): string {
        return "input";
    }
}
