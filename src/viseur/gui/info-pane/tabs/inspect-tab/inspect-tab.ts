import { ITabArgs, Tab } from "src/core/ui";
import * as inspectTabHbs from "./inspect-tab.hbs";
import "./inspect-tab.scss";
import { InspectTreeView } from "./inspect-tree";

/**
 * The "Inspect" tab on the InfoPane
 */
export class InspectTab extends Tab {
    /**
     * Creates the Inspect Tab.
     *
     * @param args - The arguments to create the tab.
     */
    constructor(args: ITabArgs) {
        super({
            contentTemplate: inspectTabHbs,
            title: "Inspect",
            ...args,
        });

        const treeView = new InspectTreeView({
            parent: this.element.find(".inspect-tree-root"),
        });

        args.viseur.events.stateChanged.on(({ game }) => {
            treeView.display({
                game: game as {}, // TODO: something sane
                settings: args.viseur.rawGamelog
                    ? args.viseur.rawGamelog.settings
                    : null,
            });
        });
    }
}
