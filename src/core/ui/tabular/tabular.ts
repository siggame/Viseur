import { onceTransitionEnds } from "src/utils/jquery";
import { createEventEmitter } from "ts-typed-events";
import { BaseElement, BaseElementArgs } from "../base-element";
import { Tab } from "./tab";
import * as tabularHbs from "./tabular.hbs";
import "./tabular.scss";

/** A block of content accessed via Tabs. */
export class Tabular extends BaseElement {
    /** Emitter for tab changed event. */
    private readonly emitTabChanged = createEventEmitter<
        Readonly<{
            /** The Tab that is now active. */
            activeTab: Tab;

            /** The tab that was previously active. */
            previousActiveTab: Tab;
        }>
    >();

    /** Triggered when the active tab changes from one to another. */
    public readonly eventTabChanged = this.emitTabChanged.event;

    /** All the tabs in this tabular. */
    private readonly tabs: Tab[] = [];

    /** The currently selected tab. */
    private activeTab!: Tab; // will always be at least the first tab

    /** Parent container to store tab's tab item in. */
    private readonly tabsElement = this.element.find(".tabular-tabs");

    /** Parent container to store tab's contents in. */
    private readonly contentsElement = this.element.find(".tabular-content");

    /** If this is fading in or out a tab. */
    private fading = false;

    constructor(
        args: BaseElementArgs & {
            /** The tabs in order to be displayed in this Tabular. */
            tabs?: Tab[];
        },
    ) {
        super(args, tabularHbs);

        if (args.tabs) {
            this.attachTabs(args.tabs);
        }
    }

    /**
     * Attaches tabs to this tabular.
     *
     * @param tabs - List of tabs to attach, only call once.
     */
    public attachTabs(tabs: Tab[]): void {
        for (const tab of tabs) {
            this.tabsElement.append(tab.tab);
            this.contentsElement.append(tab.element);

            this.tabs.push(tab);

            tab.eventSelected.on(() => {
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

        const activeTab =
            typeof newTab === "string"
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
                if (tab === previousActiveTab) {
                    // fade it out, then fade in the active tab
                    this.fadeTab(tab);
                } else {
                    tab.element
                        .removeClass("active opaque")
                        .addClass("hidden");
                }
            }
        }

        if (activeTab !== previousActiveTab) {
            this.emitTabChanged({
                activeTab,
                previousActiveTab,
            });
        }
    }

    /**
     * Gets the currently active tab.
     *
     * @returns The currently active tab.
     */
    public getActiveTab(): Tab {
        return this.activeTab;
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

            setImmediate(() => {
                // HACK: to get the fading between tabs to work
                this.activeTab.element.addClass("active");
                this.fading = false;
            });
        });
    }
}
