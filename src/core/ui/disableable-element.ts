import { Immutable } from "src/utils";
import { BaseElement, IBaseElementArgs } from "./base-element";

export interface IDisableableElementArgs extends IBaseElementArgs {
    /** true if it should be disabled upon initialization, false otherwise */
    disabled?: boolean;
}

export class DisableableElement extends BaseElement {
    /**
     * Creates an element that can be disabled.
     *
     * @param args - The args with a disabled flag option.
     * @param template - The template to pass through the the base element.
     */
    constructor(
        args: Immutable<IDisableableElementArgs>,
        template: Handlebars,
    ) {
        super(args, template);

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
