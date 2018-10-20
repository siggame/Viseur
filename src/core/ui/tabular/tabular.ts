import { onceTransitionEnds } from "src/utils/jquery";
import { Event, events } from "ts-typed-events";
import { BaseElement, IBaseElementArgs } from "../base-element";
import { Tab } from "./tab";
import * as tabularHbs from "./tabular.hbs"; // tslint:disable-line:match-default-export-name
import "./tabular.scss";

/** a block of content accessed via Tabs */
export class Tabular extends BaseElement {
    /** The events the tabular emits about its Tabs. */
    public readonly events = events({
        /** Triggered when the active tab changes from one to another */
        tabChanged: new Event<Readonly<{
            activeTab: Tab;
            previousActiveTab: Tab;
        }>>(),
    });

    /** all the tabs in this tabular */
    private readonly tabs: Tab[] = [];

    /** the currently selected tab */
    private activeTab!: Tab; // will always be at least the first tab

    /** parent container to store tab's tab item in */
    private readonly tabsElement = this.element.find(".tabular-tabs");

    /** parent container to store tab's contents in */
    private readonly contentsElement = this.element.find(".tabular-content");

    /** if this is fading in or out a tab */
    private fading: boolean = false;

    constructor(args: IBaseElementArgs & {
        tabs?: Tab[];
    }) {
        super(args, tabularHbs);

        if (args.tabs) {
            this.attachTabs(args.tabs);
        }
    }

    /**
     * Attaches tabs to this tabular
     * @param tabs list of tabs to attach, only call once
     */
    public attachTabs(tabs: Tab[]): void {
        for (const tab of tabs) {
            this.tabsElement.append(tab.tab);
            this.contentsElement.append(tab.element);

            this.tabs.push(tab);

            tab.tab.on("click", () => {
                this.setTab(tab);
            });
        }

        this.setTab(this.tabs[0]);
    }

    /**
     * Selects a tab as the active tab, based on title.
     *
     * @param newTab - The tab, or the the title of the tab, to select.
     */
    public setTab(newTab: Tab | string | undefined): void {
        if (this.fading) {
            return; // can't set while doing a fade animation
        }

        const activeTab = typeof newTab === "string"
            ? this.tabs.find((tab) => tab.title === newTab)
            : newTab;

        if (!activeTab) {
            return; // tab not found
        }

        if (!this.activeTab) {
            activeTab.element.addClass("active");
        }

        if (activeTab === this.activeTab) {
            return; // as it's already the active tab
        }

        const previousActiveTab = this.activeTab;
        this.activeTab = activeTab;

        for (const tab of this.tabs) {
            tab.tab.toggleClass("active", tab === activeTab);

            if (tab !== activeTab) {
                if (tab === previousActiveTab) { // fade it out, then fade in the active tab
                    this.fadeTab(tab);
                }
                else {
                    tab.element
                        .removeClass("active opaque")
                        .addClass("hidden");
                }
            }
        }

        if (activeTab !== previousActiveTab) {
            this.events.tabChanged.emit({
                activeTab,
                previousActiveTab,
            });
        }
    }

    /**
     * Fades a tab out, invoked when switching tabs.
     *
     * @param tab - The tab to fade out.
     */
    private fadeTab(tab: Tab): void {
        this.fading = true;

        onceTransitionEnds(tab.element.removeClass("active"), () => {
            tab.element.addClass("hidden");

            this.activeTab.element.removeClass("hidden");

            setImmediate(() => { // HACK: to get the fading between tabs to work
                this.activeTab.element.addClass("active");
                this.fading = false;
            });
        });
    }
}
