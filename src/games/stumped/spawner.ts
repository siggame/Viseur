// This is a class to represent the Spawner object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { SpawnerState, StumpedDelta } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import { ease } from "src/utils";
const STAGES = 4; // how many sprite we have for health
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Spawner extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Spawner (dt = 0). */
    public current: SpawnerState | undefined;

    /** The next state of the Spawner (dt = 1). */
    public next: SpawnerState | undefined;

    // <<-- Creer-Merge: variables -->>

    /** Our sprites, in order of stage based on growth. */
    private readonly sprites: PIXI.Sprite[] = [];

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Spawner with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Spawner.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: SpawnerState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>

        this.sprites = [];
        for (let i = 0; i < STAGES; i++) {
            this.sprites.push(
                this.addSprite[`${state.type}${i}` as "branches0"](),
            );
        }

        this.container.position.set(state.tile.x, state.tile.y);

        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Spawner
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
        current: Immutable<SpawnerState>,
        next: Immutable<SpawnerState>,
        delta: Immutable<StumpedDelta>,
        nextDelta: Immutable<StumpedDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>

        // figure out the sprite indexes to render and if they should be faded in/out
        const maxHealth = 5; // (this.game.current || this.game.next!).maxSpawnerHealth;

        const currentIndex = Math.max(
            0,
            Math.floor((STAGES * current.health) / maxHealth) - 1,
        );
        let nextIndex = Math.max(
            0,
            Math.floor((STAGES * next.health) / maxHealth) - 1,
        );

        let fade = true;
        if (currentIndex === nextIndex) {
            nextIndex = -1; // won't show up
            fade = false;
        }

        // and render the appropriate sprites
        for (let i = 0; i < this.sprites.length; i++) {
            if (i === currentIndex) {
                this.sprites[i].visible = true;
                this.sprites[i].alpha = fade ? ease(1 - dt, "cubicInOut") : 1;
            } else if (i === nextIndex) {
                // can only occur on fade out
                this.sprites[i].visible = true;
                this.sprites[i].alpha = ease(dt, "cubicInOut");
            } else {
                this.sprites[i].visible = false;
            }
        }

        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Spawner's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Spawner instance should not be rendered,
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
        current: Immutable<SpawnerState>,
        next: Immutable<SpawnerState>,
        delta: Immutable<StumpedDelta>,
        nextDelta: Immutable<StumpedDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Spawner based off its states
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
