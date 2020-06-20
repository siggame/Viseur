import { stringify } from "query-string";
import { Tab, TabArgs } from "src/core/ui";
import * as helpTabHbs from "./help-tab.hbs";
import "./help-tab.scss";
import exampleGamelog from "./example.gamelog";

const baseUrl = `${location.origin}${location.pathname}`;
const exampleGamelogUrl = `${baseUrl}?${stringify({
    log: baseUrl + exampleGamelog,
})}`;

// NOTE: **MUST** be in this pattern for babel to pickup the process.env.
// Destructuring or something more elegant breaks and we can't get these
// variables at runtime.
const gitBranch = (process.env as { [key: string]: string }).GIT_BRANCH || "";
const gitHash =
    (process.env as { [key: string]: string }).GIT_COMMIT_HASH || "";
const gitVersion =
    (process.env as { [key: string]: string }).GIT_VERSION || "???";

/**
 * The "Help" tab on the InfoPane.
 */
export class HelpTab extends Tab {
    /**
     * Creates the Help Tab.
     *
     * @param args - The arguments to create the tab.
     */
    constructor(args: TabArgs) {
        super({
            contentTemplate: helpTabHbs,
            title: "Help",
            ...{
                exampleGamelogUrl,
                gitBranch,
                gitHash,
                gitVersion,
            },
            ...args,
        });
    }
}
