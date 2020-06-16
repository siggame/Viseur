// This is a class to represent the Tile object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { CatastropheDelta, TileState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import * as Color from "color";
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
// Set this variable to `true`, if this class should render.
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Tile extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Tile (dt = 0). */
    public current: TileState | undefined;

    /** The next state of the Tile (dt = 1). */
    public next: TileState | undefined;

    // <<-- Creer-Merge: variables -->>
    /** The grass sprite for this Tile. */
    public grass: PIXI.Sprite;

    /** The bush sprite for this Tile, if it is a bush. */
    public bush: PIXI.Sprite | undefined;

    /** The berry sprite for this Tile, if it has them. */
    public berry: PIXI.Sprite | undefined;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Tile with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Tile.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: TileState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        // render the board
        // Set the parent of the tile container as the background layer
        this.container.setParent(this.game.layers.background);
        // Set the container's sprite as the ground tile Sprite
        const grassSpriteName = `grass${
            Math.abs(this.game.random.int32() % 3) + 1
        }` as "grass1" | "grass2" | "grass3";
        this.grass = this.addSprite[grassSpriteName]();

        // Change the resource here
        if (state.harvestRate > 0) {
            this.bush = this.addSprite.bush();
            this.berry = this.addSprite.berry();
            const colors = [
                Color("purple"),
                Color("yellow"),
                Color("red"),
                Color("blue"),
            ]; // by ptm
            const i = Math.abs(this.game.random.int32() % colors.length);
            this.berry.tint = colors[i].rgbNumber();
            // this.berry.tint = Color("blue").rgbNumber();
        } /** */

        // Set the position of the container to the current position
        this.container.position.set(state.x, state.y);
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Tile
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
        current: Immutable<TileState>,
        next: Immutable<TileState>,
        delta: Immutable<CatastropheDelta>,
        nextDelta: Immutable<CatastropheDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        // render where the Tile is

        if (this.bush && this.berry) {
            this.bush.visible = current.harvestRate > 0;
            this.berry.visible =
                this.bush.visible && current.turnsToHarvest === 0;
        }
        /** */
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Tile's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Tile instance should not be rendered,
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
        current: Immutable<TileState>,
        next: Immutable<TileState>,
        delta: Immutable<CatastropheDelta>,
        nextDelta: Immutable<CatastropheDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Tile based off its states
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
