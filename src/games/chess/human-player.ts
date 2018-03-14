// This is where you build your the Human player interactions with Viseur for the Anarchy game.
import { BaseHumanPlayer } from "src/viseur/game";
import { Game } from "./game";

// <<-- Creer-Merge: imports -->>
// <<-- /Creer-Merge: imports -->>

/**
 * This is the class to play the Anarchy game as a human.
 * This is similar to building an "AI", but you need to query the human player
 * for things and then use callback actions to send values to the game server.
 */
export class HumanPlayer extends BaseHumanPlayer {
    /** The game this human player is playing */
    public game!: Game;

    /**
     * Set this static flag to true to mark this game as able to be played by
     * human players. Leave as false to ignore that functionality
     */
    public static get implemented(): boolean {
    //  <<-- Creer-Merge: implemented -->>
        return true; // set this to true if humans can play this game
    //  <<-- /Creer-Merge: implemented -->>
    }

    //  <<-- Creer-Merge: variables -->>
    private endTurnCallback?: (returned: boolean) => void;
    //  <<-- /Creer-Merge: variables -->>

    /**
     * Creates the human player for this game. This class will never be
     * used if the static implemented flag above is not set to true
     * @param game the game this human player is playing
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
     * @param callback The callback that eventually returns the return value
     * from the server. - The returned value is Represents if you want to end
     * your turn. True means end your turn, False means to keep your turn going
     * and re-call this function.
     */
    public runTurn(callback: (returned: boolean) => void): void {
        // <<-- Creer-Merge: runTurn -->>
        this.endTurnCallback = callback;
        // <<-- /Creer-Merge: runTurn -->>
    }

    // <<-- Creer-Merge: functions -->>
    public handleTileClicked(pos: string): boolean {
        const piece = this.game.selectedPiece;

        // if nothing is selected, or it's not my turn
        if (!piece || !this.endTurnCallback) {
            return false;
        }

        const state = piece.current || piece.next!;

        for (const move of this.game.validMoves) {
            if (piece && move.to === pos && move.from === (state.file + state.rank)) {
                piece.move(move.to[0], Number(move.to[1]), this.game.settings.pawnPromotion.get());
                this.endTurnCallback(true);
                this.endTurnCallback = undefined;
                return true;
            }
        }

        return false;
    }
    // <<-- /Creer-Merge: functions -->>
}
