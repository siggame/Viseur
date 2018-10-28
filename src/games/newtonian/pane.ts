import { Viseur } from "src/viseur";
import { BasePane, IPaneStat } from "src/viseur/game";
import { Game } from "./game";
import { IGameState, IPlayerState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// Add additional imports you need here
// <<-- /Creer-Merge: imports -->>

/**
 * The visual pane that is displayed below the game and has text elements for
 * each player
 */
export class Pane<G extends IGameState, P extends IPlayerState> extends BasePane<G, P> {
    // <<-- Creer-Merge: variables -->>
    // if you need add more member class variables, do so here
    // <<-- /Creer-Merge: variables -->>

    /**
     * Creates the pane
     * @param viseur the Viseur instance controlling the pane
     * @param game the game this pane is displaying stats for
     * @param state the initial state of the game
     */
    constructor(viseur: Viseur, game: Game, state: IGameState) {
        super(viseur, game, state);

        // <<-- Creer-Merge: constructor -->>
        // constructor your pane here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // If you want to add more public functions, do so here
    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Gets the stats for the players score bars
     * @param state the current(most) state of the game to update this pane for
     * @returns an array of numbers, where each index is the player at that
     *          index. Sum does not matter, it will resize dynamically.
     *          If You want to display no score, return undefined
     *          or an empty array.
     */
    protected getPlayerScores(state: IGameState): number[] | undefined {
        super.getPlayersScores(state);

        // <<-- Creer-Merge: get-player-scores -->>
        return state.players.map((p) => p.heat + p.pressure); // change to return the states scores for each player
        // <<-- /Creer-Merge: get-player-scores -->>
    }

    /**
     * Gets the stats to show on the top bar of the pane,
     * which tracks stats in the game.
     * This is only called once, during initialization.
     * @param state the initial state of the game
     * @returns All the PaneStats to display on this BasePane for the game.
     */
    protected getGameStats(state: IGameState): Array<IPaneStat<G>> {
        const stats: Array<IPaneStat<G>> = super.getGameStats(state);

        // <<-- Creer-Merge: game-stats -->>
        // stuff from anarchy to play with
        // <<-- /Creer-Merge: game-stats -->>

        return stats;
    }

    /**
     * Gets the stats to show on each player pane, which tracks stats for that player
     * @param state the initial state of the game
     * @returns All the PaneStats to display on this BasePane for the player.
     */
    protected getPlayerStats(state: IGameState): Array<IPaneStat<P>> {
        const stats: Array<IPaneStat<P>> = super.getPlayerStats(state);

        // <<-- Creer-Merge: player-stats -->>
        // add stats for players to show up here
        stats.push(
            {
                title: "Some progress",
                get: (player) => `${player.heat + player.pressure} / ${state.victoryAmount}`,
                icon: "rocket",
            },
        );
        stats.push(
            {
                title: "Heat",
                icon: "free-code-camp",
                get: (player) => player.heat,
            },
        );

        stats.push(
            {
                title: "Pressure",
                icon: "diamond",
                get: (player) => player.pressure,
            },
        );
        // <<-- /Creer-Merge: player-stats -->>

        return stats;
    }

    // <<-- Creer-Merge: functions -->>
    // add more functions for your pane here
    // <<-- /Creer-Merge: functions -->>
}
