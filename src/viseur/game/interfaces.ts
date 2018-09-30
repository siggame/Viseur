import { CheckBoxSetting, ColorSetting, IBaseSettings } from "../settings";

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

/** The base settings all games have */
export interface IBaseGameSettings extends IBaseSettings {
    /** If custom player colors are enabled */
    customPlayerColors: CheckBoxSetting;

    /** An array of settings for each player's custom color */
    playerColors: ColorSetting[];
}

/** Represents an order that the game server sends game clients */
export interface IOrder {
    /** the name of the order (function name on the player class) */
    name: string;

    /** args to apply to that function name */
    args: any[];

    /** callback that will send back the returned value as the first parameter */
    callback: (returned: any) => void;
}
