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
    /** The treeview of the raw delta. */
    private readonly deltaTreeView: InspectTreeView;
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
        this.deltaTreeView = new InspectTreeView({ parent, name: "delta" });
        this.gameTreeView = new InspectTreeView({ parent, name: "game" });
        this.settingsTreeView = new InspectTreeView({
            parent,
            name: "settings",
        });

        this.viseur = args.viseur;
        this.viseur.eventReady.once(({ game, gamelog }) => {
            this.deltaTreeView.setGameName(gamelog.gameName);
            this.gameTreeView.setGameName(gamelog.gameName);
            this.settingsTreeView.setGameName(gamelog.gameName);

            // this is only ever needed once, settings never change
            // eslint-disable-next-line @typescript-eslint/ban-types
            this.settingsTreeView.display(gamelog.settings as {});

            this.refreshTree(this.viseur.getCurrentState());
            this.viseur.eventStateChanged.on((state) =>
                this.refreshTree(state),
            );

            game.eventInspect.on((gameObject) => {
                this.emitSelected();
                this.gameTreeView.expand("game", "gameObjects", gameObject.id);
            });
        });

        this.tabular.eventTabChanged.on(() =>
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

        // TODO: better types to convince TS these structures are valid
        // eslint-disable-next-line @typescript-eslint/ban-types
        this.deltaTreeView.display(state.delta as {});
        // eslint-disable-next-line @typescript-eslint/ban-types
        this.gameTreeView.display(state.game as {});
    }
}
