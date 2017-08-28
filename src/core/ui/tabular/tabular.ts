import * as $ from "jquery";
import { onceTransitionEnds } from "src/utils/jquery";
import { BaseElement, IBaseElementArgs } from "../base-element";
import { Tab } from "./tab";
import "./tabular.scss";

interface ITabularEvents {
    /** Triggered when the active tab changes from one to another */
    on(event: "tab-changed", listener: (activeTab: Tab, previousActiveTab: Tab) => void): this;
}

/** a block of content accessed via Tabs */
export class Tabular extends BaseElement implements ITabularEvents {
    /** all the tabs in this tabular */
    private tabs: Tab[] = [];

    /** the currently selected tab */
    private activeTab: Tab;

    /** parent container to store tab's tab item in */
    private tabsElement: JQuery<HTMLElement>;

    /** parent container to store tab's contents in */
    private contentsElement: JQuery<HTMLElement>;

    /** if this is fading in or out a tab */
    private fading: boolean;

    constructor(args: IBaseElementArgs & {
        tabs?: Tab[],
    }) {
        super(args);

        this.tabsElement = $(".tabular-tabs", this.element);
        this.contentsElement = $(".tabular-content", this.element);

        if (args.tabs) {
            this.attachTabs(args.tabs);
        }
    }

    /**
     * Attaches tabs to this tabular
     * @param tabs list of tabs to attach, only call once
     */
    public attachTabs(tabs: Tab[]): void {
        for (const tab of this.tabs) {
            this.tabsElement.append(tab.tab);
            this.contentsElement.append(tab.content);

            this.tabs.push(tab);

            tab.tab.on("click", () => {
                this.setTab(tab);
            });
        }

        this.setTab(this.tabs[0]);
    }

    /**
     * Selects a tab as the active tab, based on title
     * @param activeTab the tab, or the the title of the tab, to select
     */
    public setTab(activeTab: Tab | string | undefined): void {
        if (this.fading) {
            return; // can't set while doing a fade animation
        }

        if (typeof(activeTab) === "string") {
            activeTab = this.tabs.find((tab) => tab.title === activeTab);
        }

        if (!activeTab) {
            return; // tab not found
        }

        if (!this.activeTab) {
            activeTab.content.addClass("active");
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
                    tab.content
                        .removeClass("active opaque")
                        .addClass("hidden");
                }
            }
        }

        if (activeTab !== previousActiveTab) {
            this.emit("tab-changed", activeTab, previousActiveTab);
        }
    }

    protected getTemplate(): Handlebars {
        return require("./tabular.hbs");
    }

    /**
     * Fades a tab out, invoked when switching tabs
     * @param tab - the tab to fade out
     */
    private fadeTab(tab: Tab): void {
        this.fading = true;

        onceTransitionEnds(tab.content.removeClass("active"), () => {
            tab.content.addClass("hidden");

            this.activeTab.content.removeClass("hidden");

            setImmediate(() => { // HACK: to get the fading between tabs to work
                this.activeTab.content.addClass("active");
                this.fading = false;
            });
        });
    }
}
