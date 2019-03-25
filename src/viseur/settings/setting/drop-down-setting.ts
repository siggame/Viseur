import { BaseInput, DropDown, IDropDownArgs } from "src/core/ui";
import { Constructor } from "src/utils";
import { BaseSetting, IBaseSettingArgs } from "./base-setting";

/** Represents an option that is select-able via a drop down */
export class DropDownSetting<T> extends BaseSetting<T> {
    constructor(args: IDropDownArgs<T> & IBaseSettingArgs<T>) {
        super(args, DropDown as Constructor<BaseInput<T>>);
    }
}
