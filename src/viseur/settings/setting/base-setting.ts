import { BaseInput, IBaseInputArgs } from "src/core/ui/inputs/base-input";

/**
 * A base setting represents an input that controls a single setting.
 * This is basically a wrapper around the input's interface args so that
 * we can re-use them to make settings files with compile time type checking
 */
export abstract class BaseSetting {
    protected constructor(
        /** Arguments used for this setting to create a base input */
        public readonly args: IBaseInputArgs,
        /** The class constructor for this setting's input */
        public readonly inputClass: typeof BaseInput,
    ) {}
}
