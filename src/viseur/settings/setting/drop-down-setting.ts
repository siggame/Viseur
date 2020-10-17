import { BaseInput, DropDown, DropDownArgs } from "src/core/ui";
import { Constructor } from "src/utils";
import { BaseSetting, BaseSettingArgs } from "./base-setting";

/** Represents an option that is select-able via a drop down. */
export class DropDownSetting<T> extends BaseSetting<T> {
    constructor(args: DropDownArgs<T> & BaseSettingArgs<T>) {
        super(args, DropDown as Constructor<BaseInput<T>>);
    }
}
