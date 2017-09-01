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
    constructor(args: IDisableableElementArgs) {
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
}
