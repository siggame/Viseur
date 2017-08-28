import * as dateFormat from "dateformat";
import * as $ from "jquery";
import partial from "src/core/partial";
import { Timer } from "src/core/timer";
import { BaseElement } from "src/core/ui/base-element";
import { escapeHTML, getContrastingColor, sum, traverse } from "src/utils";
import { viseur } from "src/viseur";
import { BaseGame } from "../base-game";
import { IBaseGameObjectState } from "../base-game-object";
import { IBasePlayerState } from "../base-player";
import { IBaseGameState } from "../interfaces";
import "./basePane.scss";

const requireLanguageImage = require.context("./language-images/", true, /\.png$/);

export interface IPaneStat {
    /** key within the `Player` or `Game` instances */
    key: string;

    /**
     * function that formats the value of a key during display.
     * Should take the value as an argument and return the formatted value
     */
    format?: (val: string) => string;

    /** a label to place before the (formatted) value, e.g. label: value */
    label?: string;

    /** Title to display over this stat */
    title?: string;

    /** The font-awesome icon prefix (without fa-) */
    icon?: string;
}

interface IStatsList {
    /** the list of stats in order to display */
    stats: IPaneStat[];

    /** The container element */
    element: JQuery<HTMLElement>;

    /** Mapping of the stat key to its list item element */
    statsToListElement: Map<string, JQuery<HTMLElement>>;
}

/** the base class for all game panes, which are the HTML part of the game normally used to show player stats */
export class BasePane extends BaseElement {
    /** The game this pane represents */
    public readonly game: BaseGame;

    /** The timer used to tick down a human player's time */
    private readonly humansTimer: Timer;

    /** when in human player mode, the time remaining from the last second tick */
    private humansTimeRemaining: number;

    /** The player we are ticking for */
    private humansTickingPlayer?: IBasePlayerState;

    /** stats list for the game */
    private readonly gameStatsList: IStatsList;

    /** stats list for each player, indexed by their IDs */
    private readonly playerToStatsList: Map<string, IStatsList> = new Map();

    /** Element that holds the player's stats lists */
    private readonly playersElement: JQuery<HTMLElement>;

    /** indexed by player index in game.players, to their html element */
    private readonly playerProgressBars: Map<string, JQuery<HTMLElement>> = new Map();

    /** the div containing the player progress bars */
    private readonly playerProgressBarsDiv: JQuery<HTMLElement>;

    /**
     * Creates the base pane at the bottom of the viseur below the rendered graphics
     * @param game the game this pane is representing
     * @param initialState the initial state in the game, where all players exist
     */
    constructor(game: BaseGame, initialState: IBaseGameState) {
        super({
            parent: viseur.gui.gamePaneWrapper,
        });

        const playerIDs = initialState.players.map((p) => p.id);

        this.game = game;

        if (game.humanPlayer) {
            this.humansTimer = new Timer();
            this.humansTimeRemaining = 0;

            this.humansTimer.on("finished", () => {
                this.ticked();
            });
        }

        this.element.addClass("game-" + this.game.name);

        // top of pane game stats list
        const gameStats = this.cleanStats(this.getGameStats(initialState));
        this.gameStatsList = this.createStatList(gameStats, this.element.find(".top-game-stats"), "game");

        // bottom of pane each player stats lists
        const playerStats = this.cleanStats(this.getPlayerStats(initialState));

        this.playersElement = this.element.find(".players");
        this.playersElement.addClass("number-of-players-" + playerIDs.length);

        this.playerProgressBarsDiv = this.element.find(".player-progress-bars");

        let i = 0;
        for (const player of initialState.players) {
            this.playerToStatsList.set(player.id, this.createStatList(
                playerStats,
                this.playersElement,
                `player player-${i} player-id-${player.id}`,
            ));

            this.playerProgressBars.set(player.id, $("<div>")
                .addClass(`player-${i}-progress-bar`)
                .appendTo(this.playerProgressBarsDiv),
            );

            i++;
        }

        this.recolor();
    }

    /** Recolors all the panes to their players' color */
    public recolor(): void {
        for (const player of this.game.players) {
            const color = this.game.getPlayersColor(player);

            const bar = this.playerProgressBars.get(player.id);
            if (bar) {
                bar.css("background-color", color.hex());
            }

            const list = this.playerToStatsList.get(player.id);
            if (list) {
                list.element
                    .css("background-color", color.hex())
                    .css("color", getContrastingColor(color).hex());
            }
        }
    }

    /**
     * updates the base pane upon a new state, updating player and game stats
     * @param {GameState} state - the current(most) state of the game to update reflecting
     */
    public update(state: IBaseGameState): void {
        const currentPlayer = ((state as any).currentPlayer as IBaseGameObjectState) || {};

        for (const player of state.players) {
            const playerStatsList = this.playerToStatsList.get(player.id);

            this.updateStatsList(playerStatsList as any, player); // it exists, ts being silly

            const languageKey = player.clientType.replace("#", "s").toLowerCase();
            const languageIcon = requireLanguageImage(`./${languageKey}.png`);

            if (playerStatsList) {
                playerStatsList.element
                    .toggleClass("current-player", currentPlayer.id === player.id)
                    .css("background-image", `url(${languageIcon})`);
            }
        }

        // update games
        this.updateStatsList(this.gameStatsList, state);
    }

    /**
     * Sets the player's list as a human player for special styling
     *
     * @param {string} playerID - the player's id who is the human player
     */
    public setHumanPlayer(playerID: string): void {
        this.element.find(`.player-id-${playerID}`).addClass("humans-player");
    }

    /**
     * Starts ticking the time down for a player (human client mode)
     * @param playerID the player to tick for
     */
    public startTicking(playerID: string): void {
        const gameState = this.game.current || this.game.next;
        const player = gameState.players.find((p) => p.id === playerID);
        if (!player) {
            throw new Error(`ID ${playerID} is not a valid player to start ticking for`);
        }

        this.humansTickingPlayer = player;
        this.humansTimeRemaining = player.timeRemaining;
        this.humansTimer.tick();
    }

    /**
     * Stops the player timer from ticking
     */
    public stopTicking(): void {
        this.humansTimer.pause();
        this.humansTimer.setProgress(0);
    }

    protected getTemplate(): Handlebars {
        return require("./base-pane.hbs");
    }

    /**
     * Gets the stats to show on each player pane, which tracks stats for that player
     * @param state the initial state of the game
     * @returns All the PaneStats to display on this BasePane for the player.
     */
    protected getPlayerStats(state: IBaseGameState): IPaneStat[] {
        return [
            {
                key: "name",
            },
            {
                key: "timeRemaining",
                title: "Player's time remaining (in min:sec:ms format)",
                icon: "clock-o",
                format: (val: any) => this.formatTimeRemaining(val),
            },
        ];
    }

    /**
     * Gets the stats to show on the top bar of the pane, which tracks stats in the game
     * @param {GameState} state - the initial state of the game
     * @returns All the PaneStats to display on this BasePane for the game.
     */
    protected getGameStats(state: IBaseGameState): IPaneStat[] {
        const list = [];

        if (state.hasOwnProperty("currentTurn")) {
            list.push({
                key: "currentTurn",
                label: "Turn",
            });
        }

        return list;
    }

    /**
     * Sets the progress bars to a certain percentage for each of them
     * @param progresses undefined/empty if they have no progress (hides bars),
     * or an array of numbers, indexed by their location in game.players,
     * with each value being [0, 1] for their progress...
     */
    protected setPlayersProgresses(progresses?: number[]): void {
        let summed = 0;
        if (progresses) {
            summed = sum(...progresses);
        }

        let i = 0;
        for (const player of this.game.players) {
            const bar = this.playerProgressBars.get(player.id);

            let percentage = 0;
            if (progresses && summed > 0) {
                percentage = progresses[i++] / summed;
            }

            if (bar) {
                bar.css("width", (percentage * 100) + "%");
            }
        }
    }

    /**
     * Cleans up shorthand PaneStats to all the attributes expected by the BasePane
     * @param stats the stats, that can be in shorthand, to cleanup
     * @returns All the PaneStats cleaned up
     */
    private cleanStats(stats: IPaneStat[]): IPaneStat[] {
        for (const stat of stats) {
            stat.title = stat.title || ("Player's " + stat.key);
        }

        return stats;
    }

    /**
     * Creates a stats list container to be updated by this pane
     * @param {Array.<PaneStat>} stats all the stats to list
     * @param {$} parent jQuery parent for this list
     * @param {string} [classes] optional classes for the html element
     * @returns {Object} container object containing all the parts of this list
     */
    private createStatList(stats: IPaneStat[], parent: JQuery<HTMLElement>, classes: string = ""): IStatsList {
        const list: IStatsList = {
            stats,
            element: partial(require("./base-pane-stats.hbs"), {classes}, parent),
            statsToListElement: new Map(),
        };

        for (const stat of stats) {
            list.statsToListElement.set(stat.key, $("<li>")
                .appendTo(list.element)
                .addClass("stat")
                .addClass("stat-" + stat.key)
                .attr("title", stat.title as string)
                .html(stat.key),
            );
        }

        return list;
    }

    /**
     * Updates a stats list based on a state
     * @param statsList the stats list to update each stat for from the object
     * @param obj the state information of the object
     */
    private updateStatsList(statsList: IStatsList, obj: any): void {
        for (const stat of statsList.stats) {
            let value: string = "UNDEFINED";

            if (stat.key) {
                try {
                    value = traverse(obj, stat.key.split("."));
                }
                catch (err) {
                    value = ""; // assume the key was not found, such as a player's variable was null
                }
            }

            if (stat.format) {
                value = stat.format(value);
            }

            if (stat.label) {
                value = `${stat.label}: ${value}`;
            }

            if (stat.icon) {
                // assume font awesome icon
                let icon: string = `<i class=\"icon fa fa-${stat.icon}\" aria-hidden=\"true\"></i>`;

                // but check to make sure it's not a Unicode icon
                if (stat.icon.charCodeAt(0) > 255) { // then it's a Unicode character
                    icon = `<i class=\"icon\">${stat.icon}</i>`;
                }

                value = `${icon} ${value}`;
            }

            if (stat.key === "name") {
                // escape their name so they can't do code injection
                value = escapeHTML(value);
            }

            const li = statsList.statsToListElement.get(stat.key);
            if (li) {
                li.html(value);
            }
        }
    }

    /**
     * Formats the time remaining in min:sec:ms format
     * @param {number} timeRemaining - time remaining in ns
     * @returns {string} human readable string of the time remaining in the format min:sec:ms
     */
    private formatTimeRemaining(timeRemaining: string): string {
        const time = Number(timeRemaining);
        const negative = time < 0;

        // convert ns to ms, which is what Date() expects
        const nsAsDate = new Date(Math.round(Math.abs(time / 1000000)));

        return (negative ? "-" : "") + dateFormat(nsAsDate, "MM:ss:l");
    }

    /**
     * Invoked when the timer ticks once a second
     */
    private ticked(): void {
        if (this.humansTickingPlayer) {
            this.humansTimeRemaining -= (1000 * 1000000); // 1000 ms elapsed on this tick

            const list = this.playerToStatsList.get(this.humansTickingPlayer.id);

            if (list) {
                const li = list.statsToListElement.get("timeRemaining");
                if (li) {
                    li.html(this.formatTimeRemaining(String(this.humansTimeRemaining)));
                }
            }
            this.humansTimer.restart();
        }
    }
}
