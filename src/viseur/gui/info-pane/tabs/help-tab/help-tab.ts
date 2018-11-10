import { stringify } from "query-string";
import { ITabArgs, Tab } from "src/core/ui";
import * as helpTabHbs from "./help-tab.hbs";

const baseUrl = `${location.origin}${location.pathname}`;
const exampleGamelog: string = require("file-loader!./example.gamelog"); // tslint:disable-line
const exampleGamelogUrl = `${baseUrl}?${stringify({ log: baseUrl + exampleGamelog })}`;

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
            ...{ exampleGamelogUrl },
            ...args,
        });
    }
}
