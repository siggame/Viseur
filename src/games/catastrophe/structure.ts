// This is a class to represent the Structure object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { CatastropheDelta, StructureState } from "./state-interfaces";

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
export class Structure extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Structure (dt = 0). */
    public current: StructureState | undefined;

    /** The next state of the Structure (dt = 1). */
    public next: StructureState | undefined;

    // <<-- Creer-Merge: variables -->>
    // You can add additional member variables here

    /** Our sprite. */
    public sprite: PIXI.Sprite;
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Structure with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Structure.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: StructureState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        // You can initialize your new Structure here.

        // Sets this container to be inside of the background layer of the game
        this.container.setParent(this.game.layers.structure);
        // type strings taken from game rules at
        // https://github.com/siggame/Cadre-MegaMinerAI-Dev/blob/master/Games/Catastrophe/rules.md
        this.sprite = this.addSprite.neutral();
        if (state.type === "neutral") {
            // Creates a copy of the neutral sprite and puts the copy inside of the current container
            this.sprite = this.addSprite.neutral();
        }
        if (state.type === "road") {
            this.sprite = this.addSprite.road();
            if (
                state.tile.tileSouth != null &&
                state.tile.tileSouth.structure != null &&
                state.tile.tileSouth.structure.type === "road"
            ) {
                this.sprite.anchor.y = 1;
                this.sprite.scale.y *= -1;
            }
        }
        if (state.type === "shelter") {
            this.sprite = this.addSprite.shelter();
        }
        if (state.type === "wall") {
            this.sprite = this.addSprite.wall();
        }

        if (state.type === "monument") {
            this.sprite = this.addSprite.monument();
        }
        this.container.position.set(state.tile.x, state.tile.y);
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Structure
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
        current: Immutable<StructureState>,
        next: Immutable<StructureState>,
        delta: Immutable<CatastropheDelta>,
        nextDelta: Immutable<CatastropheDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        // render where the Structure is

        // Convert next.tile to a boolean value
        this.container.visible = !!next.tile;
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Structure's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Structure instance should not be rendered,
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
        current: Immutable<StructureState>,
        next: Immutable<StructureState>,
        delta: Immutable<CatastropheDelta>,
        nextDelta: Immutable<CatastropheDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Structure based off its states
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
