import { ITabArgs, Tab } from "src/core/ui";
import { IViseurGameState } from "src/viseur/game";
import * as inspectTabHbs from "./inspect-tab.hbs";
import "./inspect-tab.scss";
import { InspectTreeView } from "./inspect-tree";

/**
 * The "Inspect" tab on the InfoPane
 */
export class InspectTab extends Tab {
    /** Our treeview we basically are. */
    private readonly treeView: InspectTreeView;

    /** The settings to display, they never change once set. */
    private settings = {};

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

        this.treeView = new InspectTreeView({
            parent: this.element.find(".inspect-tree-root"),
        });

        args.viseur.events.ready.once(({ gamelog }) => {
            this.settings = gamelog.settings;
            this.treeView.setGameName(gamelog.gameName);
            this.refreshTree(args.viseur.getCurrentState());

            args.viseur.events.stateChanged.on((state) => this.refreshTree(state));
        });
    }

    /**
     * Refreshes the tree to display a new state.
     *
     * @param state - The new game states to use to re-build the tree.
     */
    private refreshTree(state: IViseurGameState): void {
        this.treeView.display({
            game: state.game as {}, // TODO: something sane
            settings: this.settings,
        });
    }
}
