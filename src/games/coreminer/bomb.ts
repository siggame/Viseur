// This is a class to represent the Bomb object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { BombState, CoreminerDelta } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
import { ease } from "src/utils";
import { pixiFade } from "src/utils";
import { TileState } from "./state-interfaces";
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
// Set this variable to `true`, if this class should render.
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Bomb extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here

    /** Bomb scale. */
    private static readonly SCALE = 1;
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Bomb (dt = 0). */
    public current: BombState | undefined;

    /** The next state of the Bomb (dt = 1). */
    public next: BombState | undefined;

    // <<-- Creer-Merge: variables -->>
    // You can add additional member variables here

    /** This Bomb's sprite. */
    public bombSprite: PIXI.Sprite;

    /** Flag for if bomb has exploded. */
    public hasExploded: boolean;
    /** List of explosion sprites for this bomb. */
    public explosionSprites: PIXI.Sprite[];
    /** Running list of explosion sprites for all bombs to reuse. */
    public static explosionPool: PIXI.Sprite[] = [];
    /** Tile state of the tile we need to fall from if falling at spawn. */
    public startTile: TileState | undefined;
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Bomb with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Bomb.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: BombState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        // You can initialize your new Bomb here.
        this.container.scale.set(Bomb.SCALE, Bomb.SCALE);
        this.container.position.set(state.tile.x, state.tile.y);
        this.container.setParent(this.game.layers.game);
        this.bombSprite = this.addSprite.bomb();
        this.container.visible = false;
        this.hasExploded = false;
        this.explosionSprites = [];
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Bomb
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
        current: Immutable<BombState>,
        next: Immutable<BombState>,
        delta: Immutable<CoreminerDelta>,
        nextDelta: Immutable<CoreminerDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        pixiFade(this.bombSprite, dt, current.timer, next.timer);
        // if we exploded, render explosion
        if (this.hasExploded) {
            this.explosionSprites.forEach((s) => {
                s.alpha = ease(1 - dt);
            });
        }
        // if no next tile, stop
        if (!next.tile) {
            return;
        }
        // if we should be falling from spawn tile, use that otherwise use current
        const curTile = this.startTile ?? current.tile;
        // render where the Bomb is
        this.container.position.set(
            ease(curTile.x, next.tile.x, dt),
            ease(curTile.y, next.tile.y, dt),
        );

        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Bomb's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Bomb instance should not be rendered,
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
        this.explosionSprites.forEach((s) => {
            s.visible = false;
        });
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
        current: Immutable<BombState>,
        next: Immutable<BombState>,
        delta: Immutable<CoreminerDelta>,
        nextDelta: Immutable<CoreminerDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Bomb based off its states
        // if we are counting from 1 to 0, explode
        if (current && next && current.timer > 0 && next.timer == 0) {
            this.hasExploded = true;
            // get the sprites for this explosion
            this.getExplosionSprites(current.tile ?? next.tile);
        } else {
            this.hasExploded = false;
            if (this.explosionSprites.length > 0) {
                this.explosionSprites.forEach((s) => {
                    s.visible = false;
                });
                this.explosionSprites = [];
            }
        }

        // if no next tile turn invisible and quit
        if (!next.tile) {
            this.container.visible = false;
            return;
        }

        // else turn it visible
        this.container.visible = true;

        // set startTile to undefined so we don't keep rendering with it
        this.startTile = undefined;

        // if current and next exist, sanity checks (:
        if (current && next) {
            // if the delta is from a client running a valid dump function
            if (
                delta.type == "ran" &&
                delta.data.run.functionName == "dump" &&
                !delta.data.invalid
            ) {
                // get the tile argument from client's function call
                const { tile } = delta.data.run.args;
                // if the tile exists and this bomb was created in this delta
                // set start tile to tile so we fall from where they placed the bomb.
                if (
                    tile &&
                    delta.game.gameObjects &&
                    delta.game.gameObjects[this.id]
                ) {
                    // for some reason tile.getCurrentMostState isn't a function here.
                    // so here is a work around.
                    this.startTile = this.game.getCurrentMostState()
                        .gameObjects[tile.id] as TileState;
                    // this.startTile = tile.getCurrentMostState();
                }

                // this is for playback, since the first half will be called when bomb is created,
                // this covers when someone rewinds.
            } else if (
                nextDelta.type == "ran" &&
                nextDelta.data.run.functionName == "dump" &&
                !nextDelta.data.invalid
            ) {
                const { tile } = nextDelta.data.run.args;
                if (
                    tile &&
                    nextDelta.game.gameObjects &&
                    nextDelta.game.gameObjects[this.id]
                ) {
                    this.startTile = tile.getCurrentMostState();
                }
            }
        }
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    /**
     * Get the list of sprites to use in this bombs explosion.
     *
     * @param tile - This bombs tile location.
     */
    private getExplosionSprites(tile: Immutable<TileState>): void {
        const tiles: TileState[] = [];
        // clean up rid of old tiles
        this.explosionSprites.forEach((s) => {
            s.visible = false;
        });
        // reset list
        this.explosionSprites = [];

        // if for some reason we don't have a tile, no explosion to render
        if (!tile) return;

        // add current tile
        tiles.push(tile);
        // add north tile and any tile north for shockwave
        if (tile.tileNorth) {
            tiles.push(tile.tileNorth);
            let north: TileState | undefined = tile.tileNorth.tileNorth;
            if (tile.tileNorth.shielding <= 0) {
                while (north && north.dirt + north.ore <= 0) {
                    tiles.push(north);
                    north = north.shielding <= 0 ? north.tileNorth : undefined;
                }
            }
        }
        // add south tile and any tile south for shockwave
        if (tile.tileSouth) {
            tiles.push(tile.tileSouth);
            let south: TileState | undefined = tile.tileSouth.tileSouth;
            if (tile.tileSouth.shielding <= 0) {
                while (south && south.dirt + south.ore <= 0) {
                    tiles.push(south);
                    south = south.shielding <= 0 ? south.tileSouth : undefined;
                }
            }
        }
        // add east tile and any tile east for shockwave
        if (tile.tileEast) {
            tiles.push(tile.tileEast);
            let east: TileState | undefined = tile.tileEast.tileEast;
            if (tile.tileEast.shielding <= 0) {
                while (east && east.dirt + east.ore <= 0) {
                    tiles.push(east);
                    east = east.shielding <= 0 ? east.tileEast : undefined;
                }
            }
        }
        // add west tile and any tile west for shockwave
        if (tile.tileWest) {
            tiles.push(tile.tileWest);
            let west: TileState | undefined = tile.tileWest.tileWest;
            if (tile.tileWest.shielding <= 0) {
                while (west && west.dirt + west.ore <= 0) {
                    tiles.push(west);
                    west = west.shielding <= 0 ? west.tileWest : undefined;
                }
            }
        }
        // iterate through all of them and get an explosion sprite for each
        // to set in list to render
        tiles.forEach((t) => {
            const explosion = this.getExplosionSprite(t.x, t.y);
            explosion.visible = true;
            explosion.alpha = 1;
            this.explosionSprites.push(explosion);
        });
    }
    /**
     * Gets the next available explosion sprite or creates a new one.
     *
     * @param x - X position of explosion.
     * @param y - Y postition of explosion.
     * @returns Explosion sprite to be used.
     */
    private getExplosionSprite(x: number, y: number): PIXI.Sprite {
        // find a sprite not in use
        const sprite = Bomb.explosionPool.find((s) => !s.visible);
        // if found prep it and return it
        if (sprite) {
            sprite.position.set(x, y);
            sprite.alpha = 0;
            return sprite;
        }
        // otherwise create a new one
        const newSprite = this.addSprite.explosion({
            alpha: 0,
            container: this.game.layers.explosion,
            visible: false,
        });
        // prep it and return it
        newSprite.position.set(x, y);
        Bomb.explosionPool.push(newSprite);
        return newSprite;
    }
    // <<-- /Creer-Merge: protected-private-functions -->>
}
