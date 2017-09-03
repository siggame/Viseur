import { BasePane, IPaneStat } from "src/viseur/game";
import { Game } from "./game";
import { IBuildingState, IGameState, IPlayerState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import { clamp } from "src/utils";
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
     * @param game the game this pane is displaying stats for
     * @param initialState the initial state of the game
     */
    constructor(game: Game, initialState: IGameState) {
        super(game, initialState);

        // <<-- Creer-Merge: constructor -->>
        // If you need to init additional things, do so here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public_functions -->>
    // if you need to add public functions, do so here
    // <<-- /Creer-Merge: public_functions -->>

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

        // <<-- Creer-Merge: getPlayerScores -->>
        return state.players.map((player) => player.headquarters.health);
        // <<-- /Creer-Merge: getPlayerScores -->>
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
        // push PaneStats onto the stats array here
        // if you want to show additional values

        stats.push(
            {
                get: (gameState) => gameState.currentForecast.intensity,
                icon: "fire",
            },
            {
                get: (gameState) => gameState.currentForecast.direction,
                icon: "cloud",
            },
        );
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
        stats.push(
            {
                title: "Headquarter Health",
                icon: "heart",
                get: (player) => player.headquarters.health,
            },
            {
                title: "number of buildings alive",
                icon: "building-o",
                get: (player) => {
                    return player.buildings.reduce((count: number, building: IBuildingState) => {
                        // add one if the building is alive, otherwise 0
                        return count + clamp(building.health, 0, 1);
                    }, 0);
                },
            },
            {
                title: "bribes remaining",
                icon: "money",
                get: (player) => player.bribesRemaining,
            },
        );
        // <<-- /Creer-Merge: player-stats -->>

        return stats;
    }

    // <<-- Creer-Merge: functions -->>
    // add more functions for your pane here
    // <<-- /Creer-Merge: functions -->>
}
