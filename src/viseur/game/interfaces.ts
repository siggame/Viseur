import { CheckBoxSetting, ColorSetting, IBaseSettings } from "../settings";
import { BaseGame } from "./base-game";
import { BaseGameObject } from "./base-game-object";
import { BaseHumanPlayer } from "./base-human-player";
import { BasePane } from "./base-pane";
import { IBasePlayerState } from "./base-player";
import { IState } from "./state-object";

/** A reference to a game object, which just holds the ID of the game object */
export interface IGameObjectReference extends IState {
    /**
     * A unique id for each instance of a GameObject or a sub class.
     * Used for client and server communication.
     * Should never change value after being set.
     */
    id: string;
}

/** A state of a game object at a discrete point in time */
export interface IBaseGameObjectState extends IGameObjectReference {
    /**
     * String representing the top level Class that this game object is an instance of.
     * Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
     */
    gameObjectName: string;

    /**
     * Any strings logged will be stored here. Intended for debugging.
     */
    logs: string[];
}

/** dictionary of all the game object classes in a game */
export interface IBaseGameObjectClasses {
    /** index to get a game object class from their name */
    [className: string]: typeof BaseGameObject;
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

/** A collection of all known game objects in the game, indexed by their IDs */
export interface IGameObjects {
    /**
     * A mapping of every game object's ID to the actual game object.
     * Primarily used by the server and client to easily refer to the game objects via ID.
     */
    [id: string]: IBaseGameObjectState;
}

/** Represents a state of the game overall */
export interface IBaseGameState extends IState {
    /**
     * A mapping of every game object's ID to the actual game object.
     * Primarily used by the server and client to easily refer to the game objects via ID.
     */
    gameObjects: IGameObjects;

    /** List of all the players in the game. */
    players: IBasePlayerState[];

    /** A unique identifier for the game instance that is being played. */
    session: string;
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
