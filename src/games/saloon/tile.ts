// This is a class to represent the Tile object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { Viseur } from "src/viseur";
import { IDeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { GameObject } from "./game-object";
import { ITileState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class Tile extends GameObject {
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

    /** The current state of the Tile (dt = 0) */
    public current: ITileState | undefined;

    /** The next state of the Tile (dt = 1) */
    public next: ITileState | undefined;

    // <<-- Creer-Merge: variables -->>

    /** If there is a hazard on this tile, this represents it */
    private hazardSprite: PIXI.Sprite | undefined;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Tile with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this Tile
     * @param Visuer the Viseur instance that controls everything and contains
     * the game.
     */
    constructor(state: ITileState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        this.container.setParent(this.game.layers.background);

        const railContainer = new PIXI.Container();
        railContainer.setParent(this.game.layers.balcony);

        // Floor tiles of the balcony
        if (state.isBalcony) {
            this.game.resources.wall.newSprite(this.container);
            if (!(state.tileEast && state.tileWest) && state.tileNorth && state.tileSouth) {
                this.game.resources.railVertical.newSprite(railContainer, {
                    position: {
                        x: state.x + (state.tileEast ? 0.55 : -0.55),
                        y: state.y - 0.4,
                    },
                });
            }
            else if (!(state.tileNorth && state.tileSouth) && state.tileEast && state.tileWest) {
                this.game.resources.railHorizontal.newSprite(railContainer, {
                    position: {
                        x: state.x,
                        y: state.y + (state.tileSouth ? 0.45 : -0.4),
                    },
                });
            }
        }
        // Visible side of the balcony
        else if (state.tileNorth.isBalcony) {
            state.tileEast.isBalcony
                ? this.game.resources.wallCorner.newSprite(this.container)
                : this.game.resources.wallSide.newSprite(this.container);
        }
        else if (state.tileEast.isBalcony) {
            this.game.resources.shade.newSprite(this.container);
        }
        else {
            this.game.resources.tile.newSprite(this.container);
        }

        if (state.hasHazard) {
            this.hazardSprite = this.game.resources.hazardBrokenGlass.newSprite(this.container);
        }

        this.container.position.set(state.x, state.y);
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Tile
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
    public render(dt: number, current: ITileState, next: ITileState,
                  reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>
        // render where the Tile is
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this Tile's sprites.
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
    public stateUpdated(current: ITileState, next: ITileState,
                        reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        if (this.current && this.next) {
            // If hazard removed
            if (this.current.hasHazard && !this.next.hasHazard && this.hazardSprite) {
                this.hazardSprite.alpha = 0;
            }
            // If added and sprite already exists
            else if (this.hazardSprite && !this.current.hasHazard && this.next.hasHazard) {
                this.hazardSprite.alpha = 1;
            }
            // If added and sprite doesn't exist
            else if (!this.hazardSprite && !this.current.hasHazard && this.next.hasHazard) {
                this.hazardSprite = this.game.resources.hazardBrokenGlass.newSprite(this.container);
            }
        }
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
