// This is a class to represent the Game object in the game.
// If you want to render it in the game do so here.
import { Delta } from "@cadre/ts-utils/cadre";
import * as Color from "color";
import { Immutable } from "src/utils";
import { BaseGame } from "src/viseur/game";
import { IRendererSize } from "src/viseur/renderer";
import { GameObjectClasses } from "./game-object-classes";
import { HumanPlayer } from "./human-player";
import { GameResources } from "./resources";
import { GameSettings } from "./settings";
import { IGameState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import { BOARD_LENGTH_WITH_MARGINS, ChessBoardBackground } from "./chess-board-background";
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Game extends BaseGame {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The static name of this game. */
    public static readonly gameName = "Chess";

    /** The number of players in this game. the players array should be this same size */
    public static readonly numberOfPlayers = 2;

    /** The current state of the Game (dt = 0) */
    public current: IGameState | undefined;

    /** The next state of the Game (dt = 1) */
    public next: IGameState | undefined;

    /** The resource factories that can create sprites for this game */
    public readonly resources = GameResources;

    /** The human player playing this game */
    public readonly humanPlayer: HumanPlayer | undefined;

    /** The default player colors for this game, there must be one for each player */
    public readonly defaultPlayerColors: [Color, Color] = [
        // <<-- Creer-Merge: default-player-colors -->>
        Color("white"),
        Color("black"),
        // <<-- /Creer-Merge: default-player-colors -->>
    ];

    /** The custom settings for this game */
    public readonly settings = this.createSettings(GameSettings);

    /** The layers in the game */
    public readonly layers = this.createLayers({
        // <<-- Creer-Merge: layers -->>
        /** Bottom most layer, for background elements */
        background: this.createLayer(),
        /** Middle layer, for moving game objects */
        game: this.createLayer(),
        /** Top layer, for UI elements above the game */
        ui: this.createLayer(),
        // <<-- /Creer-Merge: layers -->>
    });

    /** Mapping of the class names to their class for all sub game object classes */
    public readonly gameObjectClasses = GameObjectClasses;

    // <<-- Creer-Merge: variables -->>
    // <<-- /Creer-Merge: variables -->>

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Invoked when the first game state is ready to setup the size of the renderer.
     *
     * @param state - The initialize state of the game.
     * @returns The {height, width} you for the game's size.
     */
    protected getSize(state: IGameState): IRendererSize {
        return {
            // <<-- Creer-Merge: get-size -->>
            width: BOARD_LENGTH_WITH_MARGINS,
            height: BOARD_LENGTH_WITH_MARGINS,
            // <<-- /Creer-Merge: get-size -->>
        };
    }

    /**
     * Called when Viseur is ready and wants to start rendering the game.
     * This is where you should initialize your state variables that rely on game data.
     *
     * @param state - The initialize state of the game.
     */
    protected start(state: IGameState): void {
        super.start(state);

        // <<-- Creer-Merge: start -->>
        new ChessBoardBackground(this);
        // <<-- /Creer-Merge: start -->>
    }

    /**
     * Initializes the background. It is drawn once automatically after this step.
     *
     * @param state - The initial state to use the render the background.
     */
    protected createBackground(state: IGameState): void {
        super.createBackground(state);

        // <<-- Creer-Merge: create-background -->>
        // <<-- /Creer-Merge: create-background -->>
    }

    /**
     * Called approx 60 times a second to update and render the background.
     * Leave empty if the background is static.
     *
     * @param dt - A floating point number [0, 1) which represents how far into the next turn to render at.
     * @param current - The current (most) game state, will be this.next if this.current is undefined.
     * @param next - The next (most) game state, will be this.current if this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta  - The the next (most) delta, which explains what happend.
     */
    protected renderBackground(
        dt: number,
        current: Immutable<IGameState>,
        next: Immutable<IGameState>,
        delta: Immutable<Delta>,
        nextDelta: Immutable<Delta>,
    ): void {
        super.renderBackground(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render-background -->>
        // update and re-render whatever you initialize in renderBackground
        // <<-- /Creer-Merge: render-background -->>
    }

    /**
     * Invoked when the game state updates.
     *
     * @param current - The current (most) game state, will be this.next if this.current is undefined.
     * @param next - The next (most) game state, will be this.current if this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta  - The the next (most) delta, which explains what happend.
     */
    protected stateUpdated(
        current: Immutable<IGameState>,
        next: Immutable<IGameState>,
        delta: Immutable<Delta>,
        nextDelta: Immutable<Delta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Game based on its current and next states
        // <<-- /Creer-Merge: state-updated -->>
    }
    // <<-- Creer-Merge: protected-private-functions -->>
    // <<-- /Creer-Merge: protected-private-functions -->>
}
