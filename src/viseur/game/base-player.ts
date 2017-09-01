import * as Color from "color";
import { IBaseGameObjectState } from "./interfaces";

/**
 * The base functions all Players in a game share
 * Note: this is a partial class, it must be inherited with BaseGameObject for GAME_NAME.Player instances
 */
export interface IBasePlayer {
    /** the index of this player in the game.players array */
    playersIndex: number;

    /** Gets the current color of this player */
    getColor(): Color;
}

export interface IBasePlayerState extends IBaseGameObjectState {
    /** The name of the player. */
    name: string;

    /**
     * What type of client this is,
     * e.g. 'Python', 'JavaScript', or some other language. For potential data mining purposes.
     */
    clientType: string;

    /** The amount of time (in ns) remaining for this AI to send commands. */
    timeRemaining: number;

    /** If the player won the game or not. */
    won: boolean;

    /** If the player lost the game or not. */
    lost: boolean;

    /** The reason why the player won the game. */
    reasonWon: string;

    /** The reason why the player lost the game. */
    reasonLost: string;
}
