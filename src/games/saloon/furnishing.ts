// This is a class to represent the Furnishing object in the game.
// If you want to render it in the game do so here.
import { Delta } from "cadre-ts-utils/cadre";
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { IFurnishingState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import { ease } from "src/utils";
import { GameBar } from "src/viseur/game";
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Furnishing extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Furnishing (dt = 0) */
    public current: IFurnishingState | undefined;

    /** The next state of the Furnishing (dt = 1) */
    public next: IFurnishingState | undefined;

    // <<-- Creer-Merge: variables -->>
    /** Our y position */
    public readonly y: number;

    /** Our x position */
    public readonly x: number;

    /** The game bar the represents this furnishing health */
    private readonly healthBar: GameBar;

    /** If we are a piano, this is our music being played */
    private readonly musicSprite?: PIXI.Sprite;

    /** THe sprite displayed when we are hit by something */
    private readonly hitSprite: PIXI.Sprite;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Furnishing with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Furnishing.
     * @param viseur - The Viseur instance that controls everything and contains the game.
     */
    constructor(state: IFurnishingState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        const x = state.tile.x;
        const y = state.tile.y;
        this.y = y;
        this.x = x;

        this.healthBar = new GameBar(this.container, {
            visibilitySetting: this.game.settings.showHealthBars,
            foregroundColor: 0x43AA72,
            max: state.health,
        });

        state.isPiano
            ? this.addSprite.piano()
            : this.addSprite.furnishing();

        if (state.isPiano) {
            // then it needs music sprites too
            this.musicSprite = this.addSprite.music({
                container: this.game.layers.music,
                position: {x, y: 0},
            });
        }

        this.container.position.set(x, y);

        // hit sprite
        this.hitSprite = this.addSprite.hit({
            anchor: 0.5,
            position: 0.5,
        });
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Furnishing instances.
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
        current: Immutable<IFurnishingState>,
        next: Immutable<IFurnishingState>,
        reason: Immutable<Delta>,
        nextReason: Immutable<Delta>,
    ): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>

        if (current.isDestroyed) {
            this.container.visible = false;

            if (this.musicSprite) {
                this.musicSprite.visible = false;
            }

            // we are destroyed an invisible, so let's get out of here
            return;
        }

        // else we are visible!
        this.container.visible = true;

        this.healthBar.update(ease(current.health, next.health, dt, "cubicInOut"));

        // display the hit if took damage
        const randomRotation = (current.tile.x + current.tile.y); // random-ish
        if (current.health === next.health) {
            this.hitSprite.visible = false;
        }
        else { // we got hit!
            this.hitSprite.visible = true;
            this.hitSprite.alpha = ease(1 - dt, "cubicInOut"); // fade it out
            this.hitSprite.rotation = randomRotation;
        }

        // fade out if destroyed next turn
        this.container.alpha = next.isDestroyed
            ? ease(1 - dt, "cubicInOut")
            : 1;

        if (this.musicSprite) {
            if (current.isPlaying || next.isPlaying) {
                this.musicSprite.visible = true;

                let alpha = 1;
                let y = this.y;
                if (!current.isPlaying && next.isPlaying) { // music notes need to move up
                    alpha = ease(dt, "cubicInOut");
                    y -= alpha / 2;
                }
                else if (current.isPlaying && !next.isPlaying) { // music notes need to move down
                    alpha = ease(1 - dt, "cubicInOut");
                    y -= alpha / 2;
                }
                else { // current and next isPlaying
                    y -= 0.5;
                }

                this.musicSprite.alpha = alpha;
                this.musicSprite.y = y;
            }
            else {
                this.musicSprite.visible = false;
            }
        }

        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this Furnishing's sprites.
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
        current: Immutable<IFurnishingState>,
        next: Immutable<IFurnishingState>,
        reason: Immutable<Delta>,
        nextReason: Immutable<Delta>,
    ): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        // update the Furnishing based off its states
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
