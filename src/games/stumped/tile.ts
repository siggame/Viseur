// This is a class to represent the Tile object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { Viseur } from "src/viseur";
import { IDeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { GameObject } from "./game-object";
import { ITileState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import { ease } from "src/utils";

const RESOURCES: ["branches", "food"] = ["branches", "food"];

// bit auto-tiling from:
// https://gamedevelopment.tutsplus.com/tutorials/how-to-use-tile-bitmasking-to-auto-tile-your-level-layouts--cms-25673
const DIRECTIONS: ["North", "South", "East", "West"] = ["North", "South", "East", "West"];
const CORNERS = [["North", "West"], ["North", "East"], ["South", "West"], ["South", "East"]];

const DIRECTION_BITS = {
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
 * Checks if a tile in a direction or two is a land tile for auto-tiling
 * @param state - tile we are looking at
 * @param direction - direction from tile
 * @param direction2 - direction from the direction tile
 * @returns true if that is a land tile, false otherwise
 */
function isLand(state: ITileState, direction: string, direction2?: string): boolean {
    let neighbor = (state as any)[`tile${direction}`];
    if (!neighbor) { // off map, just use our type as the off map type
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

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class Tile extends GameObject {
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

    /** The current state of the Tile (dt = 0) */
    public current: ITileState | undefined;

    /** The next state of the Tile (dt = 1) */
    public next: ITileState | undefined;

    // <<-- Creer-Merge: variables -->>

    /** If we are water and have a flow direction, this is the sprite for that. */
    private readonly flowSprite?: PIXI.Sprite;

    /** bottom of the lodge sprite */
    private readonly lodgeBottomSprite: PIXI.Sprite;

    /** bottom of the lodge sprite */
    private readonly lodgeTopSprite: PIXI.Sprite;

    /** sprite to indicate branches on this tile */
    private readonly branchesSprite: PIXI.Sprite;

    /** sprite to indicate food on this tile */
    private readonly foodSprite: PIXI.Sprite;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Tile with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this Tile
     * @param Visuer the Viseur instance that controls everything and contains
     * the game.
     */
    constructor(state: ITileState, viseur: Viseur) {
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
                    sum += (DIRECTION_BITS as any)[vert + hor]; // ts is too dumb to know this is valid
                }
            }

            byte = BIT_TO_INDEX[sum];
        }

        byte !== undefined
            ? this.game.resources.tileset.newSprite(this.container, byte)
            : this.game.resources.tileWater.newSprite(this.container);

        if (state.flowDirection) {
            this.flowSprite = this.game.resources.flow.newSprite(this.container, {
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
                    this.flowSprite.rotation += 3 * Math.PI / 2;
                    this.flowSprite.y += 1;
                    break;
            }
        }

        this.lodgeBottomSprite = this.game.resources.lodgeBottom.newSprite(this.container);
        this.lodgeTopSprite = this.game.resources.lodgeTop.newSprite(this.container);

        this.branchesSprite = this.game.resources.tileBranch.newSprite(this.container);
        this.foodSprite = this.game.resources.tileFood.newSprite(this.container);

        this.container.position.set(state.x, state.y);

        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Tile
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
    public render(dt: number, current: ITileState, next: ITileState,
                  reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>

        // render resources
        for (const resource of RESOURCES) {
            const sprite = resource === "branches"
                ? this.branchesSprite
                : this.foodSprite;

            const currentAmount = current[resource];
            const nextAmount = next[resource];

            if (currentAmount === 0 && nextAmount === 0) {
                sprite.visible = false;
            }
            else {
                sprite.visible = true;

                let opacity = 1;
                if (currentAmount === 0) {
                    // fade in as it's going from 0 to N
                    opacity = dt;
                }
                else if (nextAmount === 0) {
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
        }
        else {
            // the tile has a lodge on it at some point

            this.lodgeBottomSprite.visible = true;
            this.lodgeTopSprite.visible = true;

            // and color the top (flag part) of the lodge sprite based on the player's color
            const color = this.game.getPlayersColor(current.lodgeOwner || next.lodgeOwner);
            this.lodgeTopSprite.tint = color.rgbNumber();

            let alpha = 1;
            if (!current.lodgeOwner) {
                // then they are creating the lodge on the `next` state
                // so fade in the lodge (fade from 0 to 1)
                alpha = ease(dt, "cubicInOut");
            }
            else if (!next.lodgeOwner) {
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
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this Tile's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>

        // no need to recolor, as we recolor in render as we can change owners

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
    public stateUpdated(current: ITileState, next: ITileState,
                        reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        // update the Tile based off its states
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
