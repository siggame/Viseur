import { Tab, TabArgs } from "src/core/ui";
import { Viseur } from "src/viseur";
import { ViseurGameState } from "src/viseur/game";
import * as inspectTabHbs from "./inspect-tab.hbs";
import "./inspect-tab.scss";
import { InspectTreeView } from "./inspect-tree";

/**
 * The "Inspect" tab on the InfoPane.
 */
export class InspectTab extends Tab {
    /** Main treeview for the game. */
    private readonly gameTreeView: InspectTreeView;

    /** Three view for the settings. Never updated once set. */
    private readonly settingsTreeView: InspectTreeView;

    /** The viseur instance. */
    private readonly viseur: Viseur;

    /**
     * Creates the Inspect Tab.
     *
     * @param args - The arguments to create the tab.
     */
    constructor(args: TabArgs) {
        super({
            contentTemplate: inspectTabHbs,
            title: "Inspect",
            ...args,
        });

        const parent = this.element.find(".inspect-tree-root");
        this.gameTreeView = new InspectTreeView({ parent, name: "game" });
        this.settingsTreeView = new InspectTreeView({
            parent,
            name: "settings",
        });

        this.viseur = args.viseur;
        this.viseur.events.ready.once(({ gamelog }) => {
            this.settingsTreeView.setGameName(gamelog.gameName);
            // eslint-disable-next-line @typescript-eslint/ban-types
            this.settingsTreeView.display(gamelog.settings as {});

            this.gameTreeView.setGameName(gamelog.gameName);
            this.refreshTree(this.viseur.getCurrentState());

            this.viseur.events.stateChanged.on((state) =>
                this.refreshTree(state),
            );
        });

        this.tabular.events.tabChanged.on(() =>
            this.refreshTree(this.viseur.getCurrentState()),
        );
    }

    /**
     * Refreshes the tree to display a new state.
     *
     * @param state - The new game states to use to re-build the tree.
     */
    private refreshTree(state: ViseurGameState): void {
        if (this.tabular.getActiveTab() !== this) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/ban-types
        this.gameTreeView.display(state.game as {});
    }
}
