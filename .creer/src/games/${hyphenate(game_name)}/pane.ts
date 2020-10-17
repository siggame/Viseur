import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { BasePane, PaneStat } from "src/viseur/game";
import { Game } from "./game";
import { GameState, PlayerState } from "./state-interfaces";

${merge("// ", "imports", "// Add additional imports you need here", help=False)}

/**
 * The visual pane that is displayed below the game and has text elements for
 * each player.
 */
export class Pane extends BasePane<GameState, PlayerState> {
${merge("    // ", "variables", "    // if you need add more member class variables, do so here", help=False)}

    /**
     * Creates the pane for the ${game['name']} game.
     *
     * @param viseur - The Viseur instance controlling the pane.
     * @param game - The game this pane is displaying stats for.
     * @param state - The initial state of the game.
     */
    constructor(viseur: Viseur, game: Game, state: Immutable<GameState>) {
        super(viseur, game, state);

${merge("        // ", "constructor", "        // constructor your pane here", help=False)}
    }

${merge("    // ", "public-functions", "    // If you want to add more public functions, do so here", help=False)}

    /**
     * Gets the stats for the players score bars.
     *
     * @param state - The current(most) state of the game to update this pane for.
     * @returns An array of numbers, where each index is the player at that
     * index. Sum does not matter, it will resize dynamically. If You want
     * to display no score, return undefined.
     * An array of numbers is treated as a full bar display.
     * An array of number tuples is treated as individual bars alternatively
     * left and right aligned scaling from the first to the max second value.
     */
    protected getPlayersScores(
        state: Immutable<GameState>,
    ): Array<[number, number]> | number[] | undefined {
        super.getPlayersScores(state);

${merge("        // ", "get-player-scores", "        return undefined; // change to return the states scores for each player", help=False)}
    }

    /**
     * Gets the stats to show on the top bar of the pane,
     * which tracks stats in the game.
     * This is only called once, during initialization.
     *
     * @param state - The initial state of the game.
     * @returns - All the PaneStats to display on this BasePane for the game.
     */
    protected getGameStats(
        state: Immutable<GameState>,
    ): Array<PaneStat<GameState>> {
        const stats = super.getGameStats(state);

${merge("        // ", "game-stats", "        // add stats for games to show up here", help=False)}

        return stats;
    }

    /**
     * Gets the stats to show on each player pane,
     * which tracks stats for that player.
     *
     * @param state - The initial state of the game.
     * @returns All the PaneStats to display on this BasePane for the player.
     */
    protected getPlayerStats(
        state: Immutable<GameState>,
    ): Array<PaneStat<PlayerState>> {
        const stats = super.getPlayerStats(state);

${merge("        // ", "player-stats", "        // add stats for players to show up here", help=False)}

        return stats;
    }

${merge("    // ", "functions", "    // add more functions for your pane here", help=False)}
}
