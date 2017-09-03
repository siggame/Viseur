import { Tab } from "src/core/ui";

/**
 * The "Help" tab on the InfoPane
 */
export class HelpTab extends Tab {
    /** The title of the tab */
    public get title(): string {
        return "Help";
    }

    protected getTemplate(): Handlebars {
        return require("./help-tab.hbs");
    }
}
