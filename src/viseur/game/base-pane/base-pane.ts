import { BaseGame as CadreBaseGame, BasePlayer } from "@cadre/ts-utils/cadre";
import * as dateFormat from "dateformat";
import * as $ from "jquery";
import { escape, sum } from "lodash";
import { FontAwesomeIds } from "src/core/font-awesome";
import { partial } from "src/core/partial";
import { Timer } from "src/core/timer";
import { BaseElement } from "src/core/ui/base-element";
import {
    getContrastingColor,
    Immutable,
    isObject,
    objectHasProperty,
} from "src/utils";
import { Viseur } from "src/viseur";
import { BaseGame } from "src/viseur/game";
import * as basePaneStatsHbs from "./base-pane-stats.hbs";
import * as basePaneHbs from "./base-pane.hbs";
import "./base-pane.scss";

// This tells webpack to include all files it finds that match the png regex
// to be included in the build, that way they can be required() dynamically
// at run time, but all assets were included at build time.
const requireLanguageImageContext = require.context(
    "../language-images/", // directory to include
    true, // deep flag
    /\.png$/, // match on .png extensions
) as (key: string) => unknown;

const requireLanguageImage = (key: string): string | undefined => {
    const required = requireLanguageImageContext(key);
    if (typeof required === "string") {
        return required;
    }

    if (isObject(required) && objectHasProperty(required, "default")) {
        const defaultExport = required.default;
        return typeof defaultExport === "string" ? defaultExport : undefined;
    }
};

const TIME_REMAINING_TITLE = "time remaining (in min:sec:ms format)";
const NS_IN_MS = 1000000;
const ONE_SEC_IN_NS = NS_IN_MS * 1000;

const ensureFinite = (num: number) => (isFinite(num) ? num : 0);

/** The information for a stat on the pane. */
export interface PaneStat<T = unknown> {
    /** A label to place before the (formatted) value, e.g. Label: value. */
    label?: string;

    /** The font-awesome icon prefix (without fa-). */
    icon?: FontAwesomeIds;

    /** Title to display over this stat. */
    title?: string;

    /** Callback that is send the current player/game state and should return some value to display. */
    get(state: T): string | number | null;
}

/** The list of stats. */
export interface StatsList<T = unknown> {
    /** The list of stats in order to display. */
    stats: ReadonlyArray<PaneStat<T>>;

    /** The container element. */
    element: JQuery;

    /** Mapping of the stat key to its list item element. */
    statsToListElement: JQuery[];
}

/**
 * The base class for all game panes, which are the HTML part of the game
 * normally used to show player stats.
 */
export class BasePane<
    TBaseGameState extends CadreBaseGame,
    TBasePlayerState extends BasePlayer
> extends BaseElement {
    /** The game this pane represents. */
    public readonly game: BaseGame;

    /** The timer used to tick down a human player's time. */
    private readonly humansTimer: Timer | undefined;

    /** When in human player mode, the time remaining from the last second tick. */
    private humansTimeRemaining: number | undefined;

    /** The player we are ticking for. */
    private humansTickingPlayer?: Immutable<BasePlayer>;

    /** Stats list for the game. */
    private readonly gameStatsList: StatsList<TBaseGameState>;

    /** Stats list for each player, indexed by their IDs. */
    private readonly playerToStatsList = new Map<
        string,
        StatsList<TBasePlayerState>
    >();

    /** Element that holds the player's stats lists. */
    private readonly playersElement: JQuery;

    /** Indexed by player index in game.players, to their html element. */
    private readonly playerProgressBars = new Map<string, JQuery>();

    /** The div containing the player progress bars. */
    private readonly playerProgressBarsDiv: JQuery;

    /**
     * Creates the base pane at the bottom of the viseur below the rendered graphics.
     *
     * @param viseur - The Viseur instance controlling the pane.
     * @param game - The game this pane is representing.
     * @param initialState - The initial state in the game, where all players exist.
     */
    constructor(
        viseur: Viseur,
        game: BaseGame,
        initialState: Immutable<CadreBaseGame>,
    ) {
        super({ parent: viseur.gui.gamePaneWrapper }, basePaneHbs);

        this.game = game;

        if (game.humanPlayer) {
            this.humansTimer = new Timer();
            this.humansTimeRemaining = 0;

            this.humansTimer.eventFinished.on(() => {
                this.ticked();
            });

            viseur.eventConnectionClosed.once(() => {
                if (this.humansTimer) {
                    this.humansTimeRemaining = ONE_SEC_IN_NS;
                    this.humansTimer.pause();

                    this.ticked(true); // updates everything that we hit 0 time
                }
            });
        }

        this.element.addClass(`game-${this.game.name}`);

        // Top of pane game stats list
        const gameStats = this.cleanStats(
            this.getGameStats(initialState),
            "Game",
        );

        this.gameStatsList = this.createStatList(
            gameStats,
            this.element.find(".top-game-stats"),
            "game",
        );

        // Bottom of pane each player stats lists
        const playerStats = this.cleanStats(
            this.getPlayerStats(initialState),
            "Player",
        );

        this.playersElement = this.element.find(".players");
        this.playersElement.addClass(
            `number-of-players-${initialState.players.length}`,
        );

        this.playerProgressBarsDiv = this.element.find(
            ".player-progress-bars",
        );

        for (const [i, player] of initialState.players.entries()) {
            this.playerToStatsList.set(
                player.id,
                this.createStatList(
                    playerStats,
                    this.playersElement,
                    `player player-${i} player-id-${player.id}`,
                ),
            );

            this.playerProgressBars.set(
                player.id,
                $("<div>")
                    .addClass(`player-${i}-progress-bar`)
                    .appendTo(this.playerProgressBarsDiv),
            );
        }

        this.recolor();
    }

    /** Recolors all the panes to their players' color. */
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
     * Updates the base pane upon a new state, updating player and game stats.
     *
     * @param currentState - The current(most) state of the game to update reflecting.
     * @param nextState - The next state, if there is one..
     */
    public update(
        currentState: Immutable<CadreBaseGame>,
        nextState?: Immutable<CadreBaseGame>,
    ): void {
        const state =
            this.humansTimer && nextState
                ? // If we have a human player, so use the next state which is
                  // actually the most current state.
                  nextState
                : currentState;

        const currentPlayerId = this.getCurrentPlayerID(state);

        for (const player of state.players) {
            const playerStatsList = this.playerToStatsList.get(player.id);

            if (!playerStatsList) {
                throw new Error("Player's stat list missing");
            }

            this.updateStatsList(playerStatsList, player);
            const backgroundImageCSS = playerStatsList.element.css(
                "background-image",
            );

            if (!backgroundImageCSS || backgroundImageCSS === "none") {
                // Then we need to load the background image of their programming language icon.
                const languageKey = player.clientType
                    .replace("#", "s")
                    .toLowerCase();

                let languageIcon: string | undefined;
                try {
                    // try to get the image for the programing language
                    languageIcon = requireLanguageImage(
                        `./${languageKey}.png`,
                    );
                } catch {
                    // But if it fails we don't have an image for that icon, so give them the unknown icon instead.
                    languageIcon = requireLanguageImage("./unknown.png");
                }

                playerStatsList.element.css(
                    "background-image",
                    `url(${languageIcon})`,
                );
            }

            if (currentPlayerId) {
                playerStatsList.element.toggleClass(
                    "current-player",
                    currentPlayerId === player.id,
                );
            }
        }

        // update games
        this.updateStatsList(this.gameStatsList, state);

        // update the players progress bars
        this.setPlayersProgresses(this.getPlayersScores(state));
    }

    /**
     * Sets the player's list as a human player for special styling.
     *
     * @param playerID - The player's id who is the human player.
     */
    public setHumanPlayer(playerID: string): void {
        this.element.find(`.player-id-${playerID}`).addClass("humans-player");
    }

    /**
     * Starts ticking the time down for a player (human client mode).
     *
     * @param playerID - The player to tick for.
     */
    public startTicking(playerID: string): void {
        const gameState = this.game.getCurrentMostState();
        const player = gameState.players.find((p) => p.id === playerID);
        if (!player) {
            throw new Error(
                `ID ${playerID} is not a valid player to start ticking for`,
            );
        }

        this.humansTickingPlayer = player;
        this.humansTimeRemaining = player.timeRemaining;
        if (this.humansTimer) {
            this.humansTimer.tick();
        }
    }

    /** Stops the player timer from ticking. */
    public stopTicking(): void {
        if (this.humansTimer) {
            this.humansTimer.pause();
            this.humansTimer.setProgress(0);
        }
    }

    /**
     * Gets the stats to show on each player pane, which tracks stats for that player.
     *
     * @param state - The initial state of the game.
     * @returns All the PaneStats to display on this BasePane for the player.
     */
    protected getPlayerStats(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        state: Immutable<CadreBaseGame>,
    ): Array<PaneStat<TBasePlayerState>> {
        return [
            {
                title: "name",
                // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
                get: (player) => escape(player.name),
            },
            {
                title: TIME_REMAINING_TITLE,
                icon: "clock-o",
                // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
                get: (player) =>
                    this.formatTimeRemaining(player.timeRemaining),
            },
        ];
    }

    /**
     * Gets the stats to show on the top bar of the pane, which tracks stats in the game.
     *
     * @param state - The initial state of the game.
     * @returns All the PaneStats to display on this BasePane for the game.
     */
    protected getGameStats(
        state: Immutable<CadreBaseGame>,
    ): Array<PaneStat<TBaseGameState>> {
        const list: Array<PaneStat<TBaseGameState>> = [];

        if (objectHasProperty(state, "currentTurn")) {
            list.push({
                label: "Turn",
                get: (
                    game: CadreBaseGame & {
                        /** Turn based games should expose this for the turn number. */
                        currentTurn?: number;
                    },
                ) => Number(game.currentTurn),
            });
        }

        return list;
    }

    /**
     * Gets the stats for the players score bars.
     *
     * @param state - The current(most) state of the game to update this pane  for.
     * @returns An array of numbers, where each index is the player at that index.
     * The sum does not matter, it will resize dynamically.
     * If You want to display no score, return undefined or an empty array.
     */
    protected getPlayersScores(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        state: Immutable<CadreBaseGame>,
    ): Array<[number, number]> | number[] | undefined {
        // intended to be overridden and scores calculated there
        return undefined;
    }

    /**
     * Sets the progress bars to a certain percentage for each of them.
     *
     * @param progresses - Undefined/empty if they have no progress (hides bars),
     * or an array of numbers, indexed by their location in game.players,
     * with each value being [0, 1] for their progress.
     */
    protected setPlayersProgresses(
        progresses: Immutable<Array<[number, number]> | number[]> | undefined,
    ): void {
        if (!progresses) {
            // don't display the bars
            for (const [, bar] of this.playerProgressBars) {
                bar.css("width", 0);
            }

            return;
        }
        // if we got there they returned progress bars to render

        const { numberOfPlayers } = this.game.constructor as typeof BaseGame;
        if (progresses.length !== numberOfPlayers) {
            throw new Error(
                "Progresses length should be the same as the number of players in the game!",
            );
        }

        const summed = typeof progresses[0] === "number" ? sum(progresses) : 0;

        for (const [i, player] of this.game.players.entries()) {
            const bar = this.playerProgressBars.get(player.id);
            const progress = progresses[i];

            if (bar === undefined || progress === undefined) {
                throw new Error(
                    `Error displaying progress bar for Player #${player.id}`,
                );
            }

            bar.css(
                typeof progress === "number"
                    ? { width: `${ensureFinite((progress / summed) * 100)}%` }
                    : {
                          // it is two numbers in a tuple, e.g. [50, 100]
                          position: "absolute",
                          left: i % 2 ? "" : `${(i / numberOfPlayers) * 100}%`,
                          right:
                              i % 2
                                  ? `${
                                        (Math.abs(i + 1 - numberOfPlayers) /
                                            numberOfPlayers) *
                                        100
                                    }%`
                                  : "",
                          width: `${
                              (ensureFinite(progress[0] / progress[1]) * 100) /
                              numberOfPlayers
                          }%`,
                      },
            );
        }
    }

    /**
     * Gets the id of the player to highlight as the current player. Empty string is treated as none.
     *
     * @param state - The current/next game state, whichever is current to animate.
     * @returns A string. Must be an ID of a player in the game, otherwise empty string for no current player.
     */
    protected getCurrentPlayerID(state: Immutable<CadreBaseGame>): string {
        return (
            (objectHasProperty(state, "currentPlayer") &&
                isObject(state.currentPlayer) &&
                state.currentPlayer.id !== undefined &&
                String(state.currentPlayer.id)) ||
            ""
        );
    }

    /**
     * Cleans up shorthand PaneStats to all the attributes expected by the BasePane.
     *
     * @param stats - The stats, that can be in shorthand, to cleanup.
     * @param titlePrefix - A prefix to add to the title.
     * @returns All the PaneStats cleaned up.
     */
    private cleanStats(
        stats: ReadonlyArray<PaneStat>, // Readonly but not immutable,
        // as we do mutate the pane stats.
        titlePrefix: string,
    ): ReadonlyArray<PaneStat<TBaseGameState | TBasePlayerState>> {
        for (const stat of stats) {
            if (stat.label || stat.title) {
                stat.title = `${titlePrefix}'s ${stat.label || stat.title}`;
            }
        }

        return stats;
    }

    /**
     * Creates a stats list container to be updated by this pane.
     *
     * @param stats - All the stats to list.
     * @param parent - JQuery parent for this list.
     * @param classes - An optional classes for the html element.
     * @returns A container object containing all the parts of this list.
     */
    private createStatList(
        stats: ReadonlyArray<PaneStat<TBaseGameState | TBasePlayerState>>,
        parent: JQuery,
        classes = "",
    ): StatsList<TBaseGameState | TBasePlayerState> {
        const element = partial(basePaneStatsHbs, { classes }, parent);

        const list: StatsList<TBaseGameState | TBasePlayerState> = {
            stats,
            element,
            statsToListElement: [],
        };

        for (const [i, stat] of stats.entries()) {
            list.statsToListElement.push(
                $("<li>")
                    .appendTo(list.element)
                    .addClass("stat")
                    .addClass(`stat-${i}`)
                    .attr("title", stat.title || "")
                    .html(String(i)), // safe, it will always be a number
            );
        }

        return list;
    }

    /**
     * Updates a stats list based on a state.
     *
     * @param statsList - The stats list to update each stat for from the object.
     * @param obj - The state information of the object.
     */
    private updateStatsList(statsList: StatsList, obj: unknown): void {
        let i = -1;
        for (const stat of statsList.stats) {
            i++;
            let value = "";
            let hide = false;

            if (stat.get) {
                const got = stat.get(obj);
                if (got === null) {
                    hide = true;
                }
                value = String(got);
            }

            if (stat.label) {
                value = `${stat.label}: ${value}`;
            }

            if (stat.icon) {
                const icon =
                    stat.icon.charCodeAt(0) > 255
                        ? // if it is a unicode character, use that as the icon
                          `<i class="icon">${stat.icon}</i>`
                        : // else, assume it is a font-awesome icon.
                          `<i class="icon fa fa-${stat.icon}" aria-hidden="true"></i>`;

                value = `${icon} ${value}`;
            }

            const li = statsList.statsToListElement[i];
            if (li) {
                li.toggle(!hide).html(value);
            }
        }
    }

    /**
     * Formats the time remaining in min:sec:ms format.
     *
     * @param timeRemaining - The time remaining in ns.
     * @returns A human readable string of the time remaining in the format min:sec:ms.
     */
    private formatTimeRemaining(timeRemaining: number): string {
        const negative = timeRemaining < 0;

        // convert ns to ms, which is what Date() expects
        const ms = Math.round(Math.abs(timeRemaining / NS_IN_MS));
        const nsAsDate = new Date(ms);

        return (negative ? "-" : "") + dateFormat(nsAsDate, "MM:ss:l");
    }

    /**
     * Invoked when the timer ticks once a second.
     *
     * @param doNotRestart - Flag to not restart the timer.
     */
    private ticked(doNotRestart?: boolean): void {
        if (this.humansTickingPlayer) {
            this.humansTimeRemaining =
                (this.humansTimeRemaining || 0) - ONE_SEC_IN_NS;

            const list = this.playerToStatsList.get(
                this.humansTickingPlayer.id,
            );

            if (list) {
                const index = list.stats.findIndex((s) =>
                    Boolean(s.title && s.title.includes(TIME_REMAINING_TITLE)),
                );
                const li = list.statsToListElement[index];
                if (li) {
                    li.html(
                        this.formatTimeRemaining(this.humansTimeRemaining),
                    );
                }
            }

            if (!doNotRestart && this.humansTimer) {
                this.humansTimer.restart();
            }
        }
    }
}
