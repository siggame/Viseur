// This is a class to represent the Structure object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { IDeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { GameObject } from "./game-object";
import { IStructureState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class Structure extends GameObject {
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

    /** The current state of the Structure (dt = 0) */
    public current: IStructureState;

    /** The next state of the Structure (dt = 1) */
    public next: IStructureState;

    // <<-- Creer-Merge: variables -->>
    // You can add additional member variables here

    public sprite: PIXI.Sprite;
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Structure with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this Structure
     * @param game the game this Structure is in
     */
    constructor(state: IStructureState, game: Game) {
        super(state, game);

        // <<-- Creer-Merge: constructor -->>
        // You can initialize your new Structure here.

        // Sets this container to be inside of the background layer of the game
        this.container.setParent(this.game.layers.structure);

        // type strings taken from game rules at
        // https://github.com/siggame/Cadre-MegaMinerAI-Dev/blob/master/Games/Catastrophe/rules.md
        if (state.type === "neutral") {
            // Creates a copy of the neutral sprite and puts the copy inside of the current container
            this.sprite = this.game.resources.neutral.newSprite(this.container);
        }
        if (state.type === "road") {
            this.sprite = this.game.resources.road.newSprite(this.container);
            if (state.tile.tileSouth != null && state.tile.tileSouth.structure != null
                && state.tile.tileSouth.structure.type === "road") {
                this.sprite.anchor.y = 1;
                this.sprite.scale.y *= -1;
            }
        }
        if (state.type === "shelter") {
            this.sprite = this.game.resources.shelter.newSprite(this.container);
        }
        if (state.type === "wall") {
            this.sprite = this.game.resources.wall.newSprite(this.container);
        }
        if (state.type === "monument") {
            this.sprite = this.game.resources.monument.newSprite(this.container);
        }

        this.container.position.set(state.tile.x, state.tile.y);
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Structure
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
    public render(dt: number, current: IStructureState, next: IStructureState,
                  reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>
        // render where the Structure is
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this Structure's sprites.
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
    public stateUpdated(current: IStructureState, next: IStructureState,
                        reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        // update the Structure based off its states
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // NOTE: past this block are functions only used 99% of the time if
    //       the game supports human playable clients (like Chess).
    //       If it does not, feel free to ignore everything past here.

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
