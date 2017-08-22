import { BaseInput, IBaseInputArgs } from "./base-input";

export interface INumberInputArgs extends IBaseInputArgs {
    /** the minimum accepted number */
    min?: number;

    /** the maximum accepted number */
    max?: number;

    /** the number that values can change by */
    step?: number;

    /** the numeric value */
    value?: number | "any";
}

/** a text input for numbers */
export class NumberInput extends BaseInput {
    /**
     * Initializes the Number Input
     * @param {object} args - initialization args, can have min, max, and step
     */
    constructor(args: INumberInputArgs) {
        super(Object.assign({
            min: 0,
            max: 1,
            step: 1,
            value: "any",
        } as INumberInputArgs, args));

        this.setMin(args.min || 0);
        this.setMax(args.max || 1);
        this.setStep(args.step || 1);
    }

    // TODO: override set value and clamp numeric input

    /**
     * Sets the min attribute of this input
     * @param {number} min - the minimum value this number input can be
     */
    public setMin(min: number): void {
        // this.min = min;
        this.element.attr("min", min);

        if (this.actualValue < min) {
            this.value = min;
        }
    }

    /**
     * Sets the max attribute of this input
     * @param {number} max - the maximum value this number input can be
     */
    public setMax(max: number): void {
        // this.max = max;
        this.element.attr("max", max);

        if (this.actualValue > max) {
            this.value = max;
        }
    }

    /**
     * Sets the step attribute of this input
     * @param {number=} step - how much this number input increases/decreases by for each incremiment.
     */
    public setStep(step: number): void {
        // this.step = step;
        this.element.attr("step", step);
    }
}
