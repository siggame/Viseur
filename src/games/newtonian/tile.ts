// This is a class to represent the Tile object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { NewtonianDelta, TileState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import * as PIXI from "pixi.js";
import { pixiFade } from "src/utils";
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

    /** The current state of the Tile (dt = 0). */
    public current: TileState | undefined;

    /** The next state of the Tile (dt = 1). */
    public next: TileState | undefined;

    // <<-- Creer-Merge: variables -->>
    /** Sprite for the wall on this tile. */
    public readonly wall: PIXI.Sprite;

    /** The bar on this tile. */
    private readonly barSprite: PIXI.Sprite;

    /** Ore sprite on this tile. */
    private readonly oreSprite: PIXI.Sprite;

    /** The ID of the owner of this tile. */
    private readonly ownerID?: string;

    /** The generator or spawn for the room. */
    private readonly ownerOverlay: PIXI.Sprite | undefined;

    /** The container for all ore sprites. */
    private readonly oreContainer: PIXI.Container;

    /** The sprite for a door. */
    private readonly door: PIXI.Sprite | undefined;

    /** The sprite for an open door. */
    private readonly openDoor: PIXI.Sprite | undefined;
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
        this.container.position.set(state.x, state.y);

        if (state.owner) {
            this.ownerID = state.owner.id;
        }

        this.oreContainer = new PIXI.Container();
        this.oreContainer.setParent(this.game.layers.ore);
        this.oreContainer.position.copyFrom(this.container.position);

        state.type === "conveyor"
            ? this.addSprite.conveyor()
            : this.addSprite.floor();

        if (this.ownerID !== undefined) {
            this.ownerOverlay =
                state.type === "generator"
                    ? this.addSprite.genRoom()
                    : this.addSprite.spawn();
        }

        this.wall = this.addSprite.wall();
        this.barSprite = this.addSprite.resourceBar({
            container: this.oreContainer,
        });
        this.oreSprite = this.addSprite.resourceOre({
            container: this.oreContainer,
        });

        const isDoor =
            !state.isWall &&
            this.ownerID === undefined &&
            state.type !== "conveyor" &&
            state.decoration;

        if (isDoor) {
            const isEast = state.decoration === 2;
            this.door = isEast
                ? this.addSprite.door()
                : this.addSprite.eastDoor();

            this.openDoor = isEast
                ? this.addSprite.openDoor()
                : this.addSprite.eastOpenDoor();
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
        delta: Immutable<NewtonianDelta>,
        nextDelta: Immutable<NewtonianDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>

        pixiFade(this.wall, dt, Number(next.isWall), Number(current.isWall));
        this.oreContainer.visible = true;
        pixiFade(
            this.barSprite,
            dt,
            current.redium || current.blueium,
            next.redium || next.blueium,
        );
        pixiFade(
            this.oreSprite,
            dt,
            current.rediumOre || current.blueiumOre,
            next.rediumOre || next.blueiumOre,
        );

        if (this.door && this.openDoor) {
            if (!next.unit) {
                this.door.visible = true;
                this.openDoor.visible = false;
            } else {
                this.door.visible = false;
                this.openDoor.visible = true;
            }
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
        if (this.ownerID !== undefined && this.ownerOverlay) {
            const ownerColor = this.game.getPlayersColor(this.ownerID);
            this.ownerOverlay.tint = ownerColor.rgbNumber();
        }

        this.recolorResources(
            this.getCurrentMostState(),
            this.getNextMostState(),
        );

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
        this.oreContainer.visible = false; // not a child of our container, so we must manually hide it.
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
        delta: Immutable<NewtonianDelta>,
        nextDelta: Immutable<NewtonianDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        this.recolorResources(current, next);
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>

    /**
     * Recolors the resource sprites in this tile according to player color.
     *
     * @param current - The current tile state.
     * @param next - The next tile state.
     */
    private recolorResources(
        current: Immutable<TileState>,
        next: Immutable<TileState>,
    ): void {
        let colorIndex: number | undefined;

        switch (true) {
            case Boolean(
                current.redium ||
                    next.redium ||
                    current.rediumOre ||
                    next.rediumOre,
            ):
                colorIndex = 0;
                break;
            case Boolean(
                current.blueium ||
                    next.blueium ||
                    current.blueiumOre ||
                    next.blueiumOre,
            ):
                colorIndex = 1;
        }

        if (colorIndex === undefined) {
            return; /// nothing to recolor
        }

        // Use the Player color on the ore so color blinded people can change the color to disinguish between them.
        const color = this.game
            .getPlayersColor(this.game.players[colorIndex])
            .rgbNumber();
        this.barSprite.tint = color;
        this.oreSprite.tint = color;
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}
