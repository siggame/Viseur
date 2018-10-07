import { Tab } from "src/core/ui";

/**
 * The "Help" tab on the InfoPane
 */
export class HelpTab extends Tab {
    /** The title of the tab */
    public get title(): string {
        return "Help";
    }

    /**
     * Gets the template for the help tab.
     *
     * @returns The handlebars template.
     */
    protected getTemplate(): Handlebars {
        // tslint:disable-next-line:no-require-imports
        return require("./help-tab.hbs");
    }
}
