// This is a class to represent the Checker object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { Viseur } from "src/viseur";
import { IDeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { GameObject } from "./game-object";
import { ICheckerState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import { ease, getContrastingColor } from "src/utils";
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class Checker extends GameObject {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /**
     * Change this to return true to actually render instances of super classes
     * @returns true if we should render game object classes of this instance,
     *          false otherwise which optimizes playback speed
     */
    public get shouldRender(): boolean {
        // <<-- Creer-Merge: should-render -->>
        return true;
        // <<-- /Creer-Merge: should-render -->>
    }

    /** The instance of the game this game object is a part of */
    public readonly game!: Game; // set in super constructor

    /** The current state of the Checker (dt = 0) */
    public current: ICheckerState | undefined;

    /** The next state of the Checker (dt = 1) */
    public next: ICheckerState | undefined;

    // <<-- Creer-Merge: variables -->>

    /** The sprite representing the piece of this checker on the board */
    private pieceSprite: PIXI.Sprite;

    /** The kinged symbol on top of the piece, if kinged */
    private kingedSprite: PIXI.Sprite;

    /** The ID of our owner for recoloring */
    private ownerID: string;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Checker with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this Checker
     * @param Visuer the Viseur instance that controls everything and contains
     * the game.
     */
    constructor(state: ICheckerState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        this.ownerID = state.owner.id;

        this.container.setParent(this.game.layers.game);

        this.pieceSprite = this.game.resources.piece.newSprite(this.container);
        this.kingedSprite = this.game.resources.kinged.newSprite(this.container);
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Checker
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
    public render(dt: number, current: ICheckerState, next: ICheckerState,
                  reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>
        this.container.position.x = ease(current.x, next.x, dt);
        this.container.position.y = ease(current.y, next.y, dt);

        // figure out how to render our kinged sprite
        let kingedAlpha = 0;
        if (current.kinged && next.kinged) {
            kingedAlpha = 1;
        }
        else if (!current.kinged && next.kinged) {
            // we are getting kinged next delta, so fade in the sprite
            kingedAlpha = ease(dt);
        }
        // else 0 is fine
        this.kingedSprite.alpha = kingedAlpha * this.game.settings.kingedAlpha.get();

        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this Checker's sprites.
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
     * Invoked when the state updates.
     * @param current the current (most) state, will be this.next if
     * this.current is undefined
     * @param next the next (most) game state, will be this.current if
     * this.next is undefined
     * @param reason the reason for the current delta
     * @param nextReason the reason for the next delta
     */
    public stateUpdated(current: ICheckerState, next: ICheckerState,
                        reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        // update the Checker based off its states
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
     * Returns if the checker is owned by your player or not.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if it is yours, false if it
     * is not yours.
     */
    public isMine(callback?: (returned: boolean) => void): void {
        this.runOnServer("isMine", {}, callback);
    }

    /**
     * Moves the checker from its current location to the given (x, y).
     * @param x The x coordinate to move to.
     * @param y The y coordinate to move to.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is Returns the same checker that
     * moved if the move was successful. null otherwise.
     */
    public move(x: number, y: number, callback?: (returned: ICheckerState) =>
                void,
    ): void {
        this.runOnServer("move", {x, y}, callback);
    }

    // </Joueur functions>

    /**
     * Invoked when the right click menu needs to be shown.
     * @returns an array of context menu items, which can be
     *          {text, icon, callback} for items, or "---" for a separator
     */
    protected getContextMenu(): MenuItems {
        const menu = super.getContextMenu();

        // <<-- Creer-Merge: get-context-menu -->>
        // add context items to the menu here
        // <<-- /Creer-Merge: get-context-menu -->>

        return menu;
    }

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
