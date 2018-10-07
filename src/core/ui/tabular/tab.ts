import { partial } from "src/core/partial";
import { Viseur } from "src/viseur";
import { events, Signal } from "ts-typed-events";
import { BaseElement, IBaseElementArgs } from "../base-element";
import { Tabular } from "./tabular";

/** The interface arguments for a Tab can extend from. */
export interface ITabArgs extends IBaseElementArgs {
    /** The tabular this tab is to be a part of */
    tabular: Tabular;

    /** The Viseur instance we are in. */
    viseur: Viseur;
}

/** A Tab in a Tabular */
export class Tab extends BaseElement {
    /** The events this class emits */
    public readonly events = events({
        /** Emitted when this tab's tab is selected */
        selected: new Signal(),
    });

    /** The clickable tab that shows the content in the tabular */
    public readonly tab: JQuery;

    /** The content wrapper around the element */
    public readonly content: JQuery;

    /** The tabular this is a part of */
    public readonly tabular: Tabular;

    /** The title of the tab */
    public get title(): string {
        return "TAB_TITLE"; // intended to be overwritten by sub classes.
    }

    /**
     * Creates a new Tab in a tabular.
     *
     * @param args - The arguments to send to the Tab.
     */
    constructor(args: ITabArgs) {
        super(args);

        this.tabular = args.tabular;

        // tslint:disable-next-line:no-require-imports
        this.content = partial(require("./tab-content.hbs"), this, this.parent);
        this.content.append(this.element);

        // tslint:disable-next-line:no-require-imports
        this.tab = partial(require("./tab.hbs"), this);
        this.tab.on("click", () => {
            this.events.selected.emit();
        });
    }
}
