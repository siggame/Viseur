// This is a class to represent the Tile object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { PiratesDelta, TileState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
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

    /** The sprite for our water. */
    public water: PIXI.Sprite;

    /** The sprite for our land. */
    public land: PIXI.Sprite;
    /** Sprite for gold on land. */
    public goldLand: PIXI.Sprite;

    /** Grass sprite for land deep in the island. */
    public grass: PIXI.Sprite;
    /** Tree decoration sprite. */
    public tree: PIXI.Sprite;
    /** Alternative water sprite. */
    public water2: PIXI.Sprite;
    /** Plants decoration sprite. */
    public plants: PIXI.Sprite;

    /** If this tile has water. */
    public isWater: boolean;
    /** If this tile has a decoration. */
    public isDecoration: boolean;

    /** If this tile has a tree on it. */
    public isTree: boolean;

    /** If this tile has plants on it. */
    public isPlants: boolean;
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

        this.container.setParent(this.game.layers.background);

        const hide = { visible: true };
        this.water = this.addSprite.water(hide);
        this.land = this.addSprite.land(hide);
        this.goldLand = this.addSprite.gold(hide);
        this.isWater = state.type === "water";

        this.water2 = this.addSprite.water2(hide);
        this.grass = this.addSprite.grass(hide);
        this.isDecoration = state.decoration;

        this.isTree = this.game.random() < 0.03;
        this.tree = this.addSprite.tree(hide);
        this.isPlants = this.game.random() > 0.97;
        this.plants = this.addSprite.plants(hide);

        this.container.position.set(state.x, state.y);
        // You can initialize your new Tile here.
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
        delta: Immutable<PiratesDelta>,
        nextDelta: Immutable<PiratesDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        this.goldLand.visible = Boolean(this.current && this.current.gold > 0);

        if (this.isWater) {
            (this.isDecoration ? this.water2 : this.water).visible = true;
        } else {
            // if (this.isDecoration) {
            //     this.grass.visible = true;
            // }
            // else {
            this.land.visible = true;
            // }
        }
        if (this.isTree && !this.isWater) {
            this.tree.visible = true;
        }
        if (this.isPlants && !this.isWater && !this.isTree) {
            this.plants.visible = true;
        }
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
        delta: Immutable<PiratesDelta>,
        nextDelta: Immutable<PiratesDelta>,
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
