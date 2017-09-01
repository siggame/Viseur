// This is a class to represent the Game object in the game.
// If you want to render it in the game do so here.
import { BaseGame, IDeltaReason } from "src/viseur/game";
import { GameObjectClasses } from "./game-object-classes";
import { GameResources } from "./resources";
import { GameSettings } from "./settings";
import { IGameState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import * as Color from "color";
import * as PIXI from "pixi.js";
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class Game extends BaseGame {
    /** The static name of this game. */
    public static readonly gameName: string = "Anarchy";

    /** The number of players in this game. the players array should be this same size */
    public readonly numberOfPlayers: number = 2;

    /** The current state of the Game (dt = 0) */
    public current: IGameState;

    /** The next state of the Game (dt = 1) */
    public next: IGameState;

    /** The resource factories that can create sprites for this game */
    public readonly resources = GameResources;

    /** The custom settings for this game */
    public readonly settings = this.createSettings(GameSettings);

    /** The layers in the game */
    public layers = Object.freeze({
        // <<-- Creer-Merge: layers -->>
        /** Bottom most layer, for background elements */
        background: this.createLayer(),
        /** Middle layer, for moving game objects */
        game: this.createLayer(),
        /** beams go on top of the game layer */
        beams: this.createLayer(),
        /** Top layer, for UI elements above the game */
        ui: this.createLayer(),
        // <<-- /Creer-Merge: layers -->>
    });

    /** Mapping of the class names to their class for all sub game object classes */
    public readonly gameObjectClasses = GameObjectClasses;

    // <<-- Creer-Merge: variables -->>

    /**
     * The maximum fire a building can have.
     * Needed by buildings for calculations when they are rendering
     */
    public maxFire: number;

    /** All the tiles used to make the background */
    private tileSprites: PIXI.Sprite[] = [];

    // <<-- /Creer-Merge: variables -->>

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Called when Viseur is ready and wants to start rendering the game.
     * This is where you should initialize stuff.
     */
    protected start(state: IGameState): void {
        super.start(state);

        // <<-- Creer-Merge: start -->>

        this.maxFire = state.maxFire; // needed by buildings for calculations when they are rendering
        this.renderer.setSize(state.mapWidth, state.mapHeight);

        // default player colors
        this.defaultPlayerColors[0] = Color("#008080");
        this.defaultPlayerColors[1] = Color("#DAA520");

        // <<-- /Creer-Merge: start -->>
    }

    /**
     * initializes the background. It is drawn once automatically after this step.
     * @param state the initial state to use the render the background
     */
    protected createBackground(state: IGameState): void {
        super.createBackground(state);

        // <<-- Creer-Merge: createBackground -->>
        for (let x = 0; x < state.mapWidth; x++) {
            for (let y = 0; y < state.mapHeight; y++) {
                const tile = this.resources.tile.newSprite(this.layers.background);
                tile.x = x;
                tile.y = y;

                this.tileSprites.push(tile);
            }
        }
        // <<-- /Creer-Merge: createBackground -->>
    }

    /**
     * Called approx 60 times a second to update and render the background.
     * Leave empty if the background is static.
     * @param dt a floating point number [0, 1) which represents how
     * far into the next turn that current turn we are rendering is at
     * @param current the current (most) game state, will be this.next if
     * this.current is undefined
     * @param next the next (most) game state, will be this.current if
     * this.next is undefined
     * @param reason the reason for the current delta
     * @param nextReason the reason for the next delta
     */
    protected renderBackground(dt: number, current: IGameState, next: IGameState,
                               reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.renderBackground(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: renderBackground -->>
        // update and re-render whatever you initialize in renderBackground
        // <<-- /Creer-Merge: renderBackground -->>
    }

    /**
     * Invoked when the game state updates.
     * @param current the current (most) game state, will be this.next if
     * this.current is undefined
     * @param next the next (most) game state, will be this.current if
     * this.next is undefined
     * @param reason the reason for the current delta
     * @param nextReason the reason for the next delta
     */
    protected stateUpdated(current: IGameState, next: IGameState,
                           reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: stateUpdated -->>
        // update the Game based on its current and next states
        // <<-- /Creer-Merge: stateUpdated -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
