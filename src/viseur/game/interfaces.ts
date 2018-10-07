import { IBaseGame } from "cadre-ts-utils/cadre";
import { CheckBoxSetting, ColorSetting, IBaseSettings } from "../settings";
import { BaseGame } from "./base-game";
import { BaseHumanPlayer } from "./base-human-player";
import { BasePane } from "./base-pane";
import { DeltaReason } from "./gamelog";

/** A game state that is used to transition a dt between the two states/reasons */
export interface IViseurGameState {
    /** The current game state */
    game?: IBaseGame;
    /** The next game state */
    nextGame?: IBaseGame;
    /** The current delta reason */
    reason?: DeltaReason;
    /** The next delta reason */
    nextReason?: DeltaReason;
}

/** Represents the default layers in a game, extend to add your own to a game */
export interface IGameLayers {
    /** name lookup */
    [name: string]: PIXI.Container | undefined;
    /** Bottom most layer, for background elements */
    background: PIXI.Container;
    /** Middle layer, for moving game objects */
    game: PIXI.Container;
    /** Top layer, for UI elements above the game */
    ui: PIXI.Container;
}

/** The namespace for a specific game so we can initialize it */
export interface IBaseGameNamespace {
    /** The class constructor of the game for this namespace */
    Game: typeof BaseGame;

    /** The class constructor of the pane for this game */
    Pane: typeof BasePane;

    /** The class constructor of the human player for this game */
    HumanPlayer: typeof BaseHumanPlayer;

    /* * The list of settings for this game */
    // settings: {[key: string]: BaseSetting};
    /** The lookup object of class names to their class instance for reflection in this game */
    // gameObjectClasses: IBaseGameObjectClasses;
    /* * The path to the directory this game's namespace files exist in */
    // path: string;
}

/** The base settings all games have */
export interface IBaseGameSettings extends IBaseSettings {
    /** If custom player colors are enabled */
    customPlayerColors: CheckBoxSetting;

    /** An array of settings for each player's custom color */
    playerColors: ColorSetting[];
}
