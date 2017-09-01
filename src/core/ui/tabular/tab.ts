import { Event, events } from "src/core/event";
import partial from "src/core/partial";
import { BaseElement, IBaseElementArgs } from "../base-element";
import { Tabular } from "./tabular";

export class Tab extends BaseElement {
    /** The events this class emits */
    public readonly events = events({
        /** Emitted when this tab's tab is selected */
        selected: new Event<undefined>(),
    });

    /** the clickable tab that shows the content in the tabular */
    public readonly tab: JQuery<HTMLElement>;

    /** the content wrapper around the element */
    public readonly content: JQuery<HTMLElement>;

    /** the title of the tab */
    public readonly title: string;

    /** The tabular this is a part of */
    public readonly tabular: Tabular;

    constructor(args: IBaseElementArgs & {
        /** The tabular this tab is to be a part of */
        tabular: Tabular;
    }) {
        super(args);

        this.tabular = args.tabular;

        this.content = partial(require("./tab-content.hbs"), this, this.parent);
        this.content.append(this.element);

        this.tab = partial(require("./tab.hbs"), this);
        this.tab.on("click", () => {
            this.events.selected.emit(undefined);
        });
    }
}
