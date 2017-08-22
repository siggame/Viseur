// import * as $ from "jquery";
import partial from "src/core/partial";
import { BaseElement, IBaseElementArgs } from "../base-element";

export class Tab extends BaseElement {
    /** the clickable tab that shows the content in the tabular */
    public readonly tab: JQuery<HTMLElement>;

    /** the content wrapper around the element */
    public readonly content: JQuery<HTMLElement>;

    constructor(
        /** the title of the tab */
        public readonly title: string,
        /** base args for the element initialization */
        args: IBaseElementArgs,
    ) {
        super(args);

        this.content = partial(require("tab-contents.hbs"), this, this.parent);
        this.content.append(this.element);

        this.tab = partial(require("tab.hbs"), this);
    }
}
