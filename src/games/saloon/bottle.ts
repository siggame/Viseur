// This is a class to represent the Bottle object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { Viseur } from "src/viseur";
import { DeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { GameObject } from "./game-object";
import { IBottleState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import { ease, Immutable } from "src/utils";
import { ResourcesForGameObject } from "src/viseur/renderer";
// <<-- /Creer-Merge: imports -->>

const SHOULD_RENDER = true;

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class Bottle<TShouldRender extends boolean = boolean> extends GameObject<
    typeof SHOULD_RENDER extends true ? true : TShouldRender
> {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /**
     * Change this to return true to actually render instances of super classes
     * @returns true if we should render game object classes of this instance,
     *          false otherwise which optimizes playback speed
     */
    public readonly shouldRender = SHOULD_RENDER;

    /** The instance of the game this game object is a part of */
    public readonly game!: Game; // set in super constructor

    /** The current state of the Bottle (dt = 0) */
    public current: IBottleState | undefined;

    /** The next state of the Bottle (dt = 1) */
    public next: IBottleState | undefined;

    public addSprite!: ResourcesForGameObject<Game["resources"]>;

    // <<-- Creer-Merge: variables -->>

    /** The bottle's display as a sprite */
    private readonly sprite = this.addSprite.bottle({
        anchor: 0.5,
        position: { x: 0.5, y: 0.5 },
        relativeScale: 0.75,
    });

    /** The last DT so pausing doesn't cause us to jump in time */
    private lastDT = 0;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Bottle with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this Bottle
     * @param Visuer the Viseur instance that controls everything and contains
     * the game.
     * @param shouldRender stuff
     */
    constructor(state: Immutable<IBottleState>, viseur: Viseur, shouldRender?: TShouldRender) {
        super(state, viseur, SHOULD_RENDER || shouldRender);

        // <<-- Creer-Merge: constructor -->>
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Bottle
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
    public render(
        dt: number,
        current: Immutable<IBottleState>,
        next: Immutable<IBottleState>,
        reason: Immutable<DeltaReason>,
        nextReason: Immutable<DeltaReason>,
    ): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>
        this.container.visible = !current.isDestroyed;
        if (current.isDestroyed) {
            return; // no need to render further
        }

        this.container.alpha = 1;

        // if for the next state it died, fade it out
        let nextTile = next.tile;
        if (next.isDestroyed) {
            nextTile = current.tile; // it would normally be null, this way we can render it on its tile of death
            this.container.alpha = ease(1 - dt); // fade it out
        }

        // if this did not exist at first, fade it in
        if (!this.current) {
            this.container.alpha = ease(dt);
        }

        // rotate the bottle based on real tile when not paused
        if (this.lastDT !== dt) {
            this.lastDT = dt;
            // rotate at a constant rate, not dependent on dt
            this.sprite.rotation = Math.PI * new Date().getTime() * 2 / 1000;
        }

        this.container.position.set(
            ease(current.tile.x, nextTile.x, dt, "linear"),
            ease(current.tile.y, nextTile.y, dt, "linear"),
        );
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this Bottle's sprites.
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
    public stateUpdated(
        current: Immutable<IBottleState>,
        next: Immutable<IBottleState>,
        reason: Immutable<DeltaReason>,
        nextReason: Immutable<DeltaReason>,
    ): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        // update the Bottle based off its states
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
