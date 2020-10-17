// This is a class to represent the Tile object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { StumpedDelta, TileState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import { ease } from "src/utils";

const RESOURCES: ["branches", "food"] = ["branches", "food"];

// bit auto-tiling from:
// https://gamedevelopment.tutsplus.com/tutorials/how-to-use-tile-bitmasking-to-auto-tile-your-level-layouts--cms-25673
const DIRECTIONS: ["North", "South", "East", "West"] = [
    "North",
    "South",
    "East",
    "West",
];
const CORNERS = [
    ["North", "West"],
    ["North", "East"],
    ["South", "West"],
    ["South", "East"],
];

const DIRECTION_BITS: { [direction: string]: number } = {
    NorthWest: 1,
    North: 2,
    NorthEast: 4,
    West: 8,
    East: 16,
    SouthWest: 32,
    South: 64,
    SouthEast: 128,
};

const BIT_TO_INDEX: { [bit: number]: number } = {
    2: 1,
    8: 2,
    10: 3,
    11: 4,
    16: 5,
    18: 6,
    22: 7,
    24: 8,
    26: 9,
    27: 10,
    30: 11,
    31: 12,
    64: 13,
    66: 14,
    72: 15,
    74: 16,
    75: 17,
    80: 18,
    82: 19,
    86: 20,
    88: 21,
    90: 22,
    91: 23,
    94: 24,
    95: 25,
    104: 26,
    106: 27,
    107: 28,
    120: 29,
    122: 30,
    123: 31,
    126: 32,
    127: 33,
    208: 34,
    210: 35,
    214: 36,
    216: 37,
    218: 38,
    219: 39,
    222: 40,
    223: 41,
    248: 42,
    250: 43,
    251: 44,
    254: 45,
    255: 46,
    0: 47,
};

/**
 * Checks if a tile in a direction or two is a land tile for auto-tiling.
 *
 * @param state - Tile we are looking at.
 * @param direction - Direction from tile.
 * @param direction2 - Direction from the direction tile.
 * @returns True if that is a land tile, false otherwise.
 */
function isLand(
    state: TileState,
    direction: string,
    direction2?: string,
): boolean {
    let neighbor = state[`tile${direction}` as "tileNorth"];
    if (!neighbor) {
        // off map, just use our type as the off map type
        neighbor = state;
    }

    if (neighbor.type.toLowerCase() !== "land") {
        return false;
    }

    if (direction2) {
        return isLand(neighbor, direction2);
    }

    return true;
}

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

    /** If we are water and have a flow direction, this is the sprite for that. */
    private readonly flowSprite?: PIXI.Sprite;

    /** Bottom of the lodge sprite. */
    private readonly lodgeBottomSprite: PIXI.Sprite;

    /** Bottom of the lodge sprite. */
    private readonly lodgeTopSprite: PIXI.Sprite;

    /** Sprite to indicate branches on this tile. */
    private readonly branchesSprite: PIXI.Sprite;

    /** Sprite to indicate food on this tile. */
    private readonly foodSprite: PIXI.Sprite;

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

        let byte: number | undefined;
        if (state.type === "land") {
            // make it look cool
            let sum = 0;
            for (const direction of DIRECTIONS) {
                if (isLand(state, direction)) {
                    sum += DIRECTION_BITS[direction];
                }
            }

            for (const corner of CORNERS) {
                const vert = corner[0];
                const hor = corner[1];

                if (
                    isLand(state, vert) &&
                    isLand(state, hor) &&
                    isLand(state, vert, hor)
                ) {
                    sum += DIRECTION_BITS[vert + hor]; // ts is too dumb to know this is valid
                }
            }

            byte = BIT_TO_INDEX[sum];
        }

        byte !== undefined
            ? this.addSprite.tileset({ index: byte })
            : this.addSprite.tileWater();

        if (state.flowDirection) {
            this.flowSprite = this.addSprite.flow({
                alpha: 0.333,
            });

            switch (state.flowDirection) {
                case "East":
                    break; // default direction
                case "South":
                    this.flowSprite.rotation += Math.PI / 2;
                    this.flowSprite.x += 1;
                    break;
                case "West":
                    this.flowSprite.rotation += Math.PI;
                    this.flowSprite.x += 1;
                    this.flowSprite.y += 1;
                    break;
                case "North":
                    this.flowSprite.rotation += (Math.PI * 3) / 2;
                    this.flowSprite.y += 1;
            }
        }

        this.lodgeBottomSprite = this.addSprite.lodgeBottom();
        this.lodgeTopSprite = this.addSprite.lodgeTop();

        this.branchesSprite = this.addSprite.tileBranch();
        this.foodSprite = this.addSprite.tileFood();

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
        delta: Immutable<StumpedDelta>,
        nextDelta: Immutable<StumpedDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>

        // render resources
        for (const resource of RESOURCES) {
            const sprite =
                resource === "branches"
                    ? this.branchesSprite
                    : this.foodSprite;

            const currentAmount = current[resource];
            const nextAmount = next[resource];

            if (currentAmount === 0 && nextAmount === 0) {
                sprite.visible = false;
            } else {
                sprite.visible = true;

                let opacity = 1;
                if (currentAmount === 0) {
                    // fade in as it's going from 0 to N
                    opacity = dt;
                } else if (nextAmount === 0) {
                    // fade out as it's going from N to 0
                    opacity = 1 - dt;
                }

                sprite.alpha = ease(opacity, "cubicInOut");
            }
        }

        // render the lodge
        if (!current.lodgeOwner && !next.lodgeOwner) {
            // don't render the lodge, it's never used
            this.lodgeBottomSprite.visible = false;
            this.lodgeTopSprite.visible = false;
        } else {
            // the tile has a lodge on it at some point

            this.lodgeBottomSprite.visible = true;
            this.lodgeTopSprite.visible = true;

            // and color the top (flag part) of the lodge sprite based on the player's color
            const color = this.game.getPlayersColor(
                current.lodgeOwner || next.lodgeOwner,
            );
            this.lodgeTopSprite.tint = color.rgbNumber();

            let alpha = 1;
            if (!current.lodgeOwner) {
                // then they are creating the lodge on the `next` state
                // so fade in the lodge (fade from 0 to 1)
                alpha = ease(dt, "cubicInOut");
            } else if (!next.lodgeOwner) {
                // then they lost the lodge on the `next` state
                // so fade it out (1 to 0)
                alpha = ease(1 - dt, "cubicInOut");
            }

            this.lodgeBottomSprite.alpha = alpha;
            this.lodgeTopSprite.alpha = alpha;
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

        // no need to recolor, as we recolor in render as we can change owners

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
        delta: Immutable<StumpedDelta>,
        nextDelta: Immutable<StumpedDelta>,
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
