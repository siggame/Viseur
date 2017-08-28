import { DropDown, IDropDownArgs } from "src/core/ui/inputs/drop-down";
import { BaseSetting } from "./base-setting";

export class DropDownSetting<T> extends BaseSetting {
    constructor(args: IDropDownArgs<T>) {
        super(args, DropDown);
    }
}
