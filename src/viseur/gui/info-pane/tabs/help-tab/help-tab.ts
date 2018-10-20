import { ITabArgs, Tab } from "src/core/ui";
import * as helpTabHbs from "./help-tab.hbs"; // tslint:disable-line:match-default-export-name

/**
 * The "Help" tab on the InfoPane
 */
export class HelpTab extends Tab {
    /**
     * Creates the Help Tab.
     *
     * @param args - The arguments to create the tab.
     */
    constructor(args: ITabArgs) {
        super({
            contentTemplate: helpTabHbs,
            title: "Help",
            ...args,
        });
    }
}
