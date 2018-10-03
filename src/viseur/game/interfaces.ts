import { DeltaReason, IGamelog } from "cadre-ts-utils/cadre";
import { CheckBoxSetting, ColorSetting, IBaseSettings } from "../settings";
import { BaseGame } from "./base-game";
import { BaseHumanPlayer } from "./base-human-player";
import { BasePane } from "./base-pane";

/**
 * A gamelog that is streaming to us as we are conencted to the game server
 * LIVE.
 */
export interface IViseurGamelog extends IGamelog {
    /** if this gamelog is streaming */
    streaming?: boolean;
}

/** Represents the default layers in a game, extend to add your own to a game */
export interface IGameLayers {
    /** name lookup */
    [name: string]: PIXI.Container;

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

/** A simplier shorthand for why a delta occured. */
export interface IDeltaReason extends DeltaReason {
    /** The type of delta. */
    type: string;
}

/** The base settings all games have */
export interface IBaseGameSettings extends IBaseSettings {
    /** If custom player colors are enabled */
    customPlayerColors: CheckBoxSetting;

    /** An array of settings for each player's custom color */
    playerColors: ColorSetting[];
}
