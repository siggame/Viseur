// This is a class to represent the GameObject object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { BaseGameObject, DeltaReason } from "src/viseur/game";
import { ResourcesForGameObject } from "src/viseur/renderer";
import { Game } from "./game";
import { IGameObjectState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class GameObject extends BaseGameObject {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The instance of the game this game object is a part of */
    public readonly game!: Game; // set in super constructor

    /** The factory that will build sprites for this game object */
    public readonly addSprite!: ResourcesForGameObject<Game["resources"]>;

    /** The current state of the GameObject (dt = 0) */
    public current: Immutable<IGameObjectState> | undefined;

    /** The next state of the GameObject (dt = 1) */
    public next: Immutable<IGameObjectState> | undefined;

    // <<-- Creer-Merge: variables -->>
    // You can add additional member variables here
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the GameObject with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this GameObject
     * @param viseur the Viseur instance that controls everything and contains the game.
     */
    constructor(state: Immutable<IGameObjectState>, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        // You can initialize your new GameObject here.
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render GameObject
     * instances. Leave empty if it is not being rendered.
     * @param dt a floating point number [0, 1) which represents how
     * far into the next turn that current turn we are rendering is at
     * @param current the current (most) state, will be this.next if
     * this.current is undefined
     * @param next the next (most) state, will be this.current if
     * this.next is undefined
     * @param reason the reason for the current delta
     * @param nextReason the reason for the next delta
     */
    public render(dt: number, current: Immutable<IGameObjectState>, next: Immutable<IGameObjectState>,
                  reason: Immutable<DeltaReason>, nextReason: Immutable<DeltaReason>): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>
        // render where the GameObject is
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this GameObject's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when the state updates.
     * @param current the current (most) state, will be this.next if
     * this.current is undefined
     * @param next the next (most) game state, will be this.current if
     * this.next is undefined
     * @param reason the reason for the current delta
     * @param nextReason the reason for the next delta
     */
    public stateUpdated(current: Immutable<IGameObjectState>, next: Immutable<IGameObjectState>,
                        reason: Immutable<DeltaReason>, nextReason: Immutable<DeltaReason>): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        // update the GameObject based off its states
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // NOTE: past this block are functions only used 99% of the time if
    //       the game supports human playable clients (like Chess).
    //       If it does not, feel free to ignore everything past here.

    // <Joueur functions> --- functions invoked for human playable client

    /**
     * Adds a message to this GameObject's logs. Intended for your own debugging
     * purposes, as strings stored here are saved in the gamelog.
     * @param message A string to add to this GameObject's log. Intended for
     * debugging.
     * @param callback?
     */
    public log(message: string, callback?: (returned: void) => void): void {
        this.runOnServer("log", {message}, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
