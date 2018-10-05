import { Immutable } from "src/utils";
import { BaseElement, IBaseElementArgs } from "./base-element";

export interface IDisableableElementArgs extends IBaseElementArgs {
    /** true if it should be disabled upon initialization, false otherwise */
    disabled?: boolean;
}

export class DisableableElement extends BaseElement {
    /**
     * Creates an element that can be disabled
     * @param args the args with a disabled flag option
     */
    constructor(args: Immutable<IDisableableElementArgs>) {
        super(args);

        if (args.disabled) {
            this.disable();
        }
    }

    /**
     * Disables this input
     */
    public disable(): void {
        this.element.prop("disabled", true);
    }

    /**
     * Enables this input
     */
    public enable(): void {
        this.element.prop("disabled", false);
    }

    /**
     * Sets if this element should be enabled or disabled via a boolean value
     * @param enabled true if enabled, false otherwise
     */
    public setEnabled(enabled: boolean): void {
        if (enabled) {
            this.enable();
        }
        else {
            this.disable();
        }
    }
}
