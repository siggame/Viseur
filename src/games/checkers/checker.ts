// This is a class to represent the Checker object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { IDeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { GameObject } from "./game-object";
import { ICheckerState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
import { ease } from "src/utils";
import { Player } from "./player";
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
        return true; // change this to true to render all instances of this class
        // <<-- /Creer-Merge: should-render -->>
    }

    /** The instance of the game this game object is a part of */
    public readonly game: Game;

    /** The current state of the Checker (dt = 0) */
    public current: ICheckerState;

    /** The next state of the Checker (dt = 1) */
    public next: ICheckerState;

    // <<-- Creer-Merge: variables -->>
    // You can add additional member variables here

    /** The player that owns this piece */
    private owner: Player;

    private readonly king: PIXI.Sprite;
    private readonly checker: PIXI.Sprite;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Checker with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this Checker
     * @param game the game this Checker is in
     */
    constructor(state: ICheckerState, game: Game) {
        super(state, game);

        // <<-- Creer-Merge: constructor -->>
        // You can initialize your new Checker here.
        this.container.setParent(this.game.piecesContainer);
        this.owner = this.game.gameObjects[state.owner.id] as Player;
        this.checker = this.game.resources.checker.newSprite(this.container);
        this.king = this.game.resources.king.newSprite(this.container);

        this.king.visible = false;
        this.recolor();
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
        if (current.kinged) {
            this.king.visible = true;
        }
        else {
            this.king.visible = false;
        }

        const currentPosition = {
            x: current.x,
            y: current.y,
        };
        const nextPosition = {
            x: next.x,
            y: next.y,
        };

        this.container.position.set(
            ease(currentPosition.x, nextPosition.x, dt),
            ease(currentPosition.y, nextPosition.y, dt),
        );

        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this Checker's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        const ownerColor = this.game.getPlayersColor(this.owner);
        this.checker.tint = ownerColor.rgbNumber();
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
