import { Immutable } from "src/utils";
import { BaseInput, BaseInputArgs } from "./base-input";

/** Arguments to initialize a number input. */
export interface NumberInputArgs extends BaseInputArgs<number> {
    /** The minimum accepted number. */
    min?: number;

    /** The maximum accepted number. */
    max?: number;

    /** The number that values can change by. */
    step?: number | "any";

    /** The numeric value. */
    value?: number;
}

/** A text input for numbers. */
export class NumberInput extends BaseInput<number> {
    /**
     * Initializes the Number Input.
     *
     * @param args - The initialization args, can have min, max, and step.
     */
    constructor(args: Readonly<NumberInputArgs>) {
        super({
            value: 0,
            type: "number",
            ...args,
        } as Immutable<NumberInputArgs>);

        this.setStep(args.step === undefined ? "any" : args.step);
        this.setMin(args.min);
        this.setMax(args.max);
    }

    // TODO: override set value and clamp numeric input

    /**
     * Sets the min attribute of this input.
     *
     * @param min - The minimum value this number input can be.
     */
    public setMin(min?: number): void {
        if (min !== undefined) {
            this.element.attr("min", min);

            if (this.value < min) {
                this.value = min;
            }
        } else {
            this.element.removeAttr("min");
        }
    }

    /**
     * Sets the max attribute of this input.
     *
     * @param max - The maximum value this number input can be.
     */
    public setMax(max?: number): void {
        if (max !== undefined) {
            this.element.attr("max", max);

            if (this.value > max) {
                this.value = max;
            }
        } else {
            this.element.removeAttr("min");
        }
    }

    /**
     * Sets the step attribute of this input.
     *
     * @param step - How much this number input increases/decreases
     * by for each increment.
     */
    public setStep(step?: number | "any"): void {
        this.element.attr("step", step === undefined ? "any" : step);
    }
}
