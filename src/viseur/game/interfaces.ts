import { ITextureData } from "../renderer";
import { BaseSetting } from "../settings";
import { BaseGame } from "./base-game";
import { BaseGameObject, IBaseGameObjectState } from "./base-game-object";
import { BaseHumanPlayer } from "./base-human-player";
import { BasePane } from "./base-pane";
import { IBasePlayerState } from "./base-player";
import { IState } from "./state-object";

/** The namespace for a specific game so we can initialize it */
export interface IGameNamespace {
    /** The class constructor of the game for this namespace */
    Game: typeof BaseGame;

    /** The class constructor of the pane for this game */
    Pane: typeof BasePane;

    /** The class constructor of the human player for this game */
    HumanPlayer: typeof BaseHumanPlayer;

    /** The list of textures to load before the game can be rendered/initialized */
    textures: ITextureData[];

    /** The list of settings for this game */
    settings: BaseSetting[];

    /** The lookup object of class names to their class instance for reflection in this game */
    gameObjectClasses: {[className: string]: typeof BaseGameObject};

    /** The path to the directory this game's namespace files exist in */
    path: string;
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
    /** Bottom most layer, for background elements */
    background: PIXI.Container;
    /** Middle layer, for moving game objects */
    game: PIXI.Container;
    /** Top layer, for UI elements above the game */
    ui: PIXI.Container;
}
