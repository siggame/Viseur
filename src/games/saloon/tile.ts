// This is a class to represent the Tile object in the game.
// If you want to render it in the game do so here.
import { Delta } from "cadre-ts-utils/cadre";
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { ITileState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Tile extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

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
     *
     * @param state - The initial state of this Tile.
     * @param viseur - The Viseur instance that controls everything and contains the game.
     */
    constructor(state: ITileState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        this.container.setParent(this.game.layers.background);

        const railContainer = new PIXI.Container();
        railContainer.setParent(this.game.layers.balcony);

        // Floor tiles of the balcony
        if (state.isBalcony) {
            this.addSprite.wall();
            if (!(state.tileEast && state.tileWest) && state.tileNorth && state.tileSouth) {
                this.addSprite.railVertical({
                    container: railContainer,
                    position: {
                        x: state.x + (state.tileEast ? 0.55 : -0.55),
                        y: state.y - 0.4,
                    },
                });
            }
            else if (!(state.tileNorth && state.tileSouth) && state.tileEast && state.tileWest) {
                this.addSprite.railHorizontal({
                    container: railContainer,
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
                ? this.addSprite.wallCorner()
                : this.addSprite.wallSide();
        }
        else if (state.tileEast.isBalcony) {
            this.addSprite.shade();
        }
        else {
            this.addSprite.tile();
        }

        if (state.hasHazard) {
            this.hazardSprite = this.addSprite.hazardBrokenGlass();
        }

        this.container.position.set(state.x, state.y);
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Tile instances.
     * Leave empty if it is not being rendered.
     *
     * @param dt - A floating point number [0, 1) which represents how far into
     * the next turn that current turn we are rendering is at
     * @param current - The current (most) state, will be this.next if this.current is undefined.
     * @param next - The next (most) state, will be this.current if this.next is undefined.
     * @param reason - The current (most) reason for the current delta.
     * @param nextReason - The next (most) reason for the next delta.
     */
    public render(
        dt: number,
        current: Immutable<ITileState>,
        next: Immutable<ITileState>,
        reason: Immutable<Delta>,
        nextReason: Immutable<Delta>,
    ): void {
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
     *
     * @param current - The current (most) state, will be this.next if this.current is undefined.
     * @param next - The next (most) game state, will be this.current if this.next is undefined.
     * @param reason - The current (most) reason for the current delta.
     * @param nextReason - The next (most) reason for the next delta.
     */
    public stateUpdated(
        current: Immutable<ITileState>,
        next: Immutable<ITileState>,
        reason: Immutable<Delta>,
        nextReason: Immutable<Delta>,
    ): void {
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
                this.hazardSprite = this.addSprite.hazardBrokenGlass();
            }
        }
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
