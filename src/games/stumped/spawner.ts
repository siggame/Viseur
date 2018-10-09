// This is a class to represent the Spawner object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { Viseur } from "src/viseur";
import { IDeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { GameObject } from "./game-object";
import { ISpawnerState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import { ease } from "src/utils";
import { RendererResource } from "src/viseur/renderer";

const STAGES = 4; // how many sprite we have for health

// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class Spawner extends GameObject {
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

    /** The current state of the Spawner (dt = 0) */
    public current: ISpawnerState | undefined;

    /** The next state of the Spawner (dt = 1) */
    public next: ISpawnerState | undefined;

    // <<-- Creer-Merge: variables -->>

    private readonly sprites: PIXI.Sprite[] = [];

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Spawner with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this Spawner
     * @param Visuer the Viseur instance that controls everything and contains
     * the game.
     */
    constructor(state: ISpawnerState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>

        this.sprites = [];
        for (let i = 0; i < STAGES; i++) {
            const resource = this.game.resources[`${state.type}${i}`] as RendererResource;
            this.sprites.push(
                resource.newSprite(this.container),
            );
        }

        this.container.position.set(state.tile.x, state.tile.y);

        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Spawner
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
    public render(dt: number, current: ISpawnerState, next: ISpawnerState,
                  reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>

        // figure out the sprite indexes to render and if they should be faded in/out
        const maxHealth = 5; // (this.game.current || this.game.next!).maxSpawnerHealth;

        const currentIndex = Math.max(0, Math.floor(STAGES * current.health / maxHealth) - 1);
        let nextIndex = Math.max(0, Math.floor(STAGES * next.health / maxHealth) - 1);

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
            }
            else if (i === nextIndex) { // can only occur on fade out
                this.sprites[i].visible = true;
                this.sprites[i].alpha = ease(dt, "cubicInOut");
            }
            else {
                this.sprites[i].visible = false;
            }
        }

        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this Spawner's sprites.
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
    public stateUpdated(current: ISpawnerState, next: ISpawnerState,
                        reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        // update the Spawner based off its states
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
