import { INumberInputArgs, NumberInput } from "../number";

/** A range input for numbers */
export class Slider extends NumberInput {
    constructor(args: INumberInputArgs) {
        super(Object.assign({
            type: "range",
            step: "any",
        }, args));
    }
}
