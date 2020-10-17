// This is a class to represent the Tile object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { CoreminerDelta, TileState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import * as PIXI from "pixi.js";
import { pixiFade } from "src/utils";
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
    // You can add additional member variables here

    /** The tile sprite. */
    public tileSprite: PIXI.Sprite;

    /** Contains all the appliance sprites. */
    public readonly applianceContainer: PIXI.Container;

    /** The sprite for the ladder. */
    public ladderSprite?: PIXI.Sprite;

    /** The sprite for the support. */
    public supportSprite?: PIXI.Sprite;

    /** The sprite for the ore. */
    public oreSprite?: PIXI.Sprite;

    /** The sprite for the base. */
    public baseSprite?: PIXI.Sprite;

    /** The sprite for the hopper. */
    public hopperSprite?: PIXI.Sprite;

    /** The shield sprite. */
    public shieldSprite?: PIXI.Sprite;

    /** The owner's ID. */
    public ownerID?: string;

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
        // You can initialize your new Tile here.
        this.container.setParent(this.game.layers.background);
        this.container.position.set(state.x, state.y);

        if (state.owner) {
            this.ownerID = state.owner.id;
        }

        this.applianceContainer = new PIXI.Container();
        this.applianceContainer.setParent(this.game.layers.appliances);
        this.applianceContainer.position.copyFrom(this.container.position);

        if (state.y === 0 && state.dirt <= 0 && state.ore <= 0) {
            this.tileSprite = this.addSprite.sky();
        } else if (state.dirt > 0) {
            this.tileSprite = this.addSprite.dirt();
        } else {
            this.tileSprite = this.addSprite.dugDirt();
        }
        if (state.isBase) {
            this.baseSprite = this.addSprite.base({
                container: this.applianceContainer,
            });
            if (this.ownerID) {
                const color = this.game
                    .getPlayersColor(this.ownerID)
                    .rgbNumber();
                this.baseSprite.tint = color;
            }
        } else if (state.isHopper) {
            this.hopperSprite = this.addSprite.miningTube({
                container: this.applianceContainer,
            });
        } else if (state.isLadder) {
            this.ladderSprite = this.addSprite.ladder({
                container: this.applianceContainer,
            });
        } else if (state.isSupport) {
            this.supportSprite = this.addSprite.miningTube({
                container: this.applianceContainer,
            });
        } else if (state.ore > 0) {
            // TODO: swap in ORE sprite
            this.oreSprite = this.addSprite.ore();
        }

        if (state.shielding > 0) {
            // TODO: swap in Shield sprite
            this.shieldSprite = this.addSprite.shield({
                container: this.applianceContainer,
            });
        }
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
        delta: Immutable<CoreminerDelta>,
        nextDelta: Immutable<CoreminerDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        // render where the Tile is
        if (current.dirt > 0 && next.dirt === 0) {
            this.tileSprite = this.addSprite.dugDirt();
        } else if (current.dirt === 0 && next.dirt > 0) {
            this.tileSprite = this.addSprite.dirt();
        }

        if (this.oreSprite) {
            pixiFade(this.oreSprite, dt, current.ore, next.ore);
        } else if (next.ore > 0) {
            // TODO: swap with correct sprite
            this.oreSprite = this.addSprite.ore({
                container: this.applianceContainer,
            });
        }

        if (this.shieldSprite) {
            pixiFade(this.shieldSprite, dt, current.shielding, next.shielding);
        } else if (next.shielding > 0) {
            // TODO: swap with correct sprite
            this.shieldSprite = this.addSprite.shield({
                container: this.applianceContainer,
            });
        }

        if (this.ladderSprite) {
            pixiFade(
                this.ladderSprite,
                dt,
                Number(current.isLadder),
                Number(next.isLadder),
            );
        } else if (next.isLadder) {
            this.ladderSprite = this.addSprite.ladder({
                container: this.applianceContainer,
            });
        }

        if (current.isHopper !== next.isHopper) {
            this.hopperSprite = this.addSprite.miningTube({
                container: this.applianceContainer,
            });
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
        if (this.ownerID && this.baseSprite) {
            const color = this.game.getPlayersColor(this.ownerID).rgbNumber();
            this.baseSprite.tint = color;
        }
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
        this.applianceContainer.visible = false; // not a child of our container
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
        delta: Immutable<CoreminerDelta>,
        nextDelta: Immutable<CoreminerDelta>,
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
