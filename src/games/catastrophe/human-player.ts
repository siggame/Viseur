// This is where you build your the Human player interactions with Viseur for the Catastrophe game.
import { BaseHumanPlayer } from "src/viseur/game";
import { Game } from "./game";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * This is the class to play the Catastrophe game as a human.
 * This is similar to building an "AI", but you need to query the human player
 * for things and then use callback actions to send values to the game server.
 */
export class HumanPlayer extends BaseHumanPlayer {
    /** The game this human player is playing. */
    public game!: Game;

    /**
     * Set this static flag to true to mark this game as able to be played by
     * human players. Leave as false to ignore that functionality.
     */
    public static get implemented(): boolean {
        //  <<-- Creer-Merge: implemented -->>
        return false; // set this to true if humans can play this game
        //  <<-- /Creer-Merge: implemented -->>
    }

    //  <<-- Creer-Merge: variables -->>
    // any additional variables you want to add for the HumanPlayer
    //  <<-- /Creer-Merge: variables -->>

    /**
     * Creates the human player for this game. This class will never be
     * used if the static implemented flag above is not set to true.
     *
     * @param game - The game this human player is playing.
     */
    constructor(game: Game) {
        super(game);

        //  <<-- Creer-Merge: constructor -->>
        // construct this human player
        //  <<-- /Creer-Merge: constructor -->>
    }

    // -- Orders: things the game server tells this human player to do -- \\

    /**
     * This is called every time it is this AI.player's turn.
     *
     * @param callback - The callback that eventually returns the return value
     * from the server. - The first argument to the callback is the return
     * value: Represents if you want to end your turn. True means end your turn,
     * False means to keep your turn going and re-call this function.
     */
    public runTurn(callback: (returned: boolean) => void): void {
        // <<-- Creer-Merge: runTurn -->>
        // Put your game logic here for runTurn
        // <<-- /Creer-Merge: runTurn -->>
    }

    // <<-- Creer-Merge: functions -->>
    // any additional functions you want to add for the HumanPlayer
    // <<-- /Creer-Merge: functions -->>
}
