// This is a class to represent the Checker object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { CheckerState, CheckersDelta } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import { ease, getContrastingColor } from "src/utils";
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
// Set this variable to `true`, if this class should render.
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Checker extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Checker (dt = 0). */
    public current: CheckerState | undefined;

    /** The next state of the Checker (dt = 1). */
    public next: CheckerState | undefined;

    // <<-- Creer-Merge: variables -->>

    /** The sprite representing the piece of this checker on the board. */
    private readonly pieceSprite: PIXI.Sprite;

    /** The kinged symbol on top of the piece, if kinged. */
    private readonly kingedSprite: PIXI.Sprite;

    /** The ID of our owner for recoloring. */
    private readonly ownerID: string;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Checker with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Checker.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: CheckerState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        this.ownerID = state.owner.id;

        this.container.setParent(this.game.layers.game);

        this.pieceSprite = this.addSprite.piece();
        this.kingedSprite = this.addSprite.kinged();
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Checker
     * instances.
     * Leave empty if it is not being rendered.
     *
     * @param dt - A floating point number [0, 1) which represents how far into
     * the next turn that current turn we are rendering is at.
     * @param current - The current (most) game state, will be this.next if
     * this.current is undefined.
     * @param next - The next (most) game state, will be this.current if
     * this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta - The the next (most) delta, which explains what
     * happend.
     */
    public render(
        dt: number,
        current: Immutable<CheckerState>,
        next: Immutable<CheckerState>,
        delta: Immutable<CheckersDelta>,
        nextDelta: Immutable<CheckersDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        this.container.position.x = ease(current.x, next.x, dt);
        this.container.position.y = ease(current.y, next.y, dt);

        // figure out how to render our kinged sprite
        let kingedAlpha = 0;
        if (current.kinged && next.kinged) {
            kingedAlpha = 1;
        } else if (!current.kinged && next.kinged) {
            // we are getting kinged next delta, so fade in the sprite
            kingedAlpha = ease(dt);
        }
        // else 0 is fine
        this.kingedSprite.alpha =
            kingedAlpha * this.game.settings.kingedAlpha.get();

        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Checker's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        const color = this.game.getPlayersColor(this.ownerID);

        this.pieceSprite.tint = color.rgbNumber();
        this.kingedSprite.tint = getContrastingColor(color).rgbNumber();
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Checker instance should not be rendered,
     * such as going back in time before it existed.
     *
     * By default the super hides container.
     * If this sub class adds extra PIXI objects outside this.container, you
     * should hide those too in here.
     */
    public hideRender(): void {
        super.hideRender();

        // <<-- Creer-Merge: hide-render -->>
        // hide anything outside of `this.container`.
        // <<-- /Creer-Merge: hide-render -->>
    }

    /**
     * Invoked when the state updates.
     *
     * @param current - The current (most) game state, will be this.next if
     * this.current is undefined.
     * @param next - The next (most) game state, will be this.current if
     * this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta - The the next (most) delta, which explains what
     * happend.
     */
    public stateUpdated(
        current: Immutable<CheckerState>,
        next: Immutable<CheckerState>,
        delta: Immutable<CheckersDelta>,
        nextDelta: Immutable<CheckersDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Checker based off its states
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // <Joueur functions> --- functions invoked for human playable client
    // NOTE: These functions are only used 99% of the time if the game
    // supports human playable clients (like Chess).
    // If it does not, feel free to ignore these Joueur functions.

    /**
     * Returns if the checker is owned by your player or not.
     *
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if it is yours, false if it
     * is not yours.
     */
    public isMine(callback: (returned: boolean) => void): void {
        this.runOnServer("isMine", {}, callback);
    }

    /**
     * Moves the checker from its current location to the given (x, y).
     *
     * @param x - The x coordinate to move to.
     * @param y - The y coordinate to move to.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is Returns the same checker that
     * moved if the move was successful. Otherwise null.
     */
    public move(
        x: number,
        y: number,
        callback: (returned: CheckerState) => void,
    ): void {
        this.runOnServer("move", { x, y }, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
