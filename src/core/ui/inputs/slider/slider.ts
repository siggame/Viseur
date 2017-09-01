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
}
