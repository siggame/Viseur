import { Delta, BaseGame as CadreBaseGame } from "@cadre/ts-utils/cadre";
import { BaseSettings, CheckBoxSetting, ColorSetting } from "../settings";
import { BaseGame } from "./base-game";
import { BaseGameObject } from "./base-game-object";
import { BaseHumanPlayer } from "./base-human-player";
import { BasePane } from "./base-pane";

/**
 * A game state that is used to transition a dt between the
 * two states/reasons.
 */
export interface ViseurGameState {
    /** The current game state. */
    game?: CadreBaseGame;
    /** The next game state. */
    nextGame?: CadreBaseGame;
    /** The current delta. */
    delta?: Delta;
    /** The next delta. */
    nextDelta?: Delta;
}

/**
 * Represents the default layers in a game, extend to add your own to a game.
 */
export interface GameLayers {
    /** Name lookup. */
    [name: string]: PIXI.Container | undefined;

    /** Bottom most layer, for background elements. */
    background: PIXI.Container;

    /** Middle layer, for moving game objects. */
    game: PIXI.Container;

    /** Top layer, for UI elements above the game. */
    ui: PIXI.Container;
}

/** The namespace for a specific game so we can initialize it. */
export interface BaseGameNamespace<
    G extends typeof BaseGame = typeof BaseGame,
    P extends typeof BasePane = typeof BasePane,
    H extends typeof BaseHumanPlayer = typeof BaseHumanPlayer
> {
    /** The class constructor of the game for this namespace. */
    Game: G;

    /** The class constructor of the pane for this game. */
    Pane: P;

    /** The class constructor of the human player for this game. */
    HumanPlayer: H;

    /* * The list of settings for this game */
    // settings: {[key: string]: BaseSetting};
    /**
     * The lookup object of class names to their class instance for
     * reflection in this game.
     */
    // gameObjectClasses: IBaseGameObjectClasses;
    /** The path to the directory this game's namespace files exist in. */
    // path: string;
}

/** The base settings all games have. */
export interface BaseGameSettings extends BaseSettings {
    /** If custom player colors are enabled. */
    customPlayerColors: CheckBoxSetting;

    /** An array of settings for each player's custom color. */
    playerColors: ColorSetting[];
}

/** The base interface all games export for the game object classes object. */
export interface BaseGameObjectClasses {
    [gameObjectClass: string]: typeof BaseGameObject | undefined;
}
