import { BasePlayer } from "@cadre/ts-utils/cadre";
import * as Color from "color";

/**
 * The base functions all Players in a game share.
 *
 * Note: this is a partial class, it must be inherited with BaseGameObject for GAME_NAME.Player instances.
 */
export interface BasePlayerInstance extends BasePlayer {
    /** The index of this player in the game.players array. */
    playersIndex: number;

    /** Gets the current color of this player. */
    getColor(): Color;
}
