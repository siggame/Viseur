// This is a class to represent the Cowboy object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import {
    CowboyState,
    FurnishingState,
    SaloonDelta,
    TileState,
} from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import * as Color from "color";
import { ease, Point, updown } from "src/utils";
import { GameBar, getTileNeighbor } from "src/viseur/game";

const DRUNK_COLOR = Color().hsl(127, 33, 50);
const TILE_DIRECTIONS = ["North", "East", "South", "West"] as const;
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Cowboy extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Cowboy (dt = 0). */
    public current: CowboyState | undefined;

    /** The next state of the Cowboy (dt = 1). */
    public next: CowboyState | undefined;

    // <<-- Creer-Merge: variables -->>

    /** This cowboy's job. */
    private readonly job: string;

    /** The id of the player that owns this cowboy. */
    private readonly ownerID: string;

    /** The bar that display's this cowboy's health. */
    private readonly healthBar: GameBar;

    /** The bottom (non-colored) part of the cowboy. */
    private readonly spriteBottom: PIXI.Sprite;

    /** The top (colored) part of the cowboy. */
    private readonly spriteTop: PIXI.Sprite;

    /** The sprite that displays when we are hit. */
    private readonly hitSprite: PIXI.Sprite;

    /** True when we are being rendered playing a piano. */
    private playingPianoAt?: Point;

    // -- Sharpshooter Specific Variables -- \\
    /** If the shot is visible. */
    private shotVisible = false;

    /** The sprites that are used to generate the shot bullet trail. */
    private readonly shotSprites = new Array<PIXI.Sprite>();

    /** Faded colors used to show sharpshooter's focus. */
    private readonly focusTiles = new Array<{
        /** The sprite used to show focus. */
        sprite: PIXI.Sprite;

        /** If we are fading in or out. */
        fade?: "in" | "out";
    }>();

    /** Focus sprites that are free to re-use. */
    private readonly freeFocusSprites = new Array<PIXI.Sprite>();

    /** All the focus sprites, even ones that are used. */
    private readonly allFocusSprites = new Array<PIXI.Sprite>();

    // -- Brawler Specific Variables --\\

    /** The attack displayed when the brawler attacks. */
    private readonly brawlerAttack: PIXI.Sprite | undefined;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Cowboy with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Cowboy.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: CowboyState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        this.job = state.job;
        this.ownerID = state.owner.id;

        this.spriteBottom = this.addSprite[`cowboy${this.job}Bottom`]();
        this.spriteTop = this.addSprite[`cowboy${this.job}Top`]();

        if (this.ownerID === "0") {
            // then they are first player, so flip them
            this.spriteBottom.scale.x *= -1;
            this.spriteBottom.anchor.x += 1;
            this.spriteTop.scale.x *= -1;
            this.spriteTop.anchor.x += 1;
        }

        // hit damage animation
        this.hitSprite = this.addSprite.hit({
            anchor: 0.5,
            position: { x: 0.5, y: 0.5 },
        });

        switch (this.job) {
            case "Sharpshooter":
                // create initial shot sprites
                this.shotSprites.push(
                    this.game.resources.shotHead.newSprite({
                        anchor: 0.5,
                        container: this.game.layers.bullets,
                        visible: false,
                    }),
                );

                this.game.settings.sharpshooterFocus.changed.on(() => {
                    this.recolor();
                });

                break;
            case "Brawler":
                this.brawlerAttack = this.game.resources.brawlAttack.newSprite(
                    {
                        anchor: 0.5,
                        container: this.game.layers.brawl,
                        relativeScale: 2,
                        visible: false,
                    },
                );
        }

        this.healthBar = new GameBar(this.container, {
            visibilitySetting: this.game.settings.showHealthBars,
            max: state.health,
        });

        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Cowboy
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
        current: Immutable<CowboyState>,
        next: Immutable<CowboyState>,
        delta: Immutable<SaloonDelta>,
        nextDelta: Immutable<SaloonDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        this.container.visible = !current.isDead;

        if (current.isDead) {
            return; // no need to render further
        }

        // if we got here we are visible!
        this.container.alpha = 1;

        this.healthBar.update(ease(current.health, next.health, dt));

        // display the hit if took damage
        const randomRotation = current.tile.x + current.tile.y; // random-ish
        if (current.health === next.health) {
            this.hitSprite.visible = false;
        } else {
            // we got hit!
            this.hitSprite.visible = true;
            this.hitSprite.alpha = ease(1 - dt); // fade it out
            this.hitSprite.rotation = randomRotation;
        }

        // if for the next state it died, fade it out
        let nextTile = next.tile;
        if (next.isDead) {
            nextTile = current.tile; // it would normally be null, this way we can render it on it's tile of death
            this.container.alpha = ease(1 - dt); // fade it out
        }

        // if this did not exist at first, fade it in
        if (!this.current) {
            this.container.alpha = ease(dt);
        }

        // move the container if we moved
        this.container.position.set(
            ease(current.tile.x, nextTile.x, dt),
            ease(current.tile.y, nextTile.y, dt),
        );

        // updown tween to move us towards the piano if we played it
        if (this.playingPianoAt) {
            const d = updown(dt);
            const dx = (this.playingPianoAt.x - current.tile.x) / 2;
            const dy = (this.playingPianoAt.y - current.tile.y) / 2;

            this.container.x += dx * d;
            this.container.y += dy * d;
        }

        // if the next frame has drunk
        let drunkLum = 1; // default to max whiteness
        if (current.isDrunk && !next.isDrunk) {
            // then we are fading out of drunk-ness
            drunkLum = ease(dt);
        } else if (!current.isDrunk && next.isDrunk) {
            // then we are fading into drunk-ness
            drunkLum = ease(1 - dt);
        } else if (current.isDrunk && next.isDrunk) {
            // we are just drunk
            drunkLum = 0;
        }

        this.spriteBottom.tint = DRUNK_COLOR.whiten(drunkLum).rgbNumber();

        // if sharpshooter shooting
        if (this.shotVisible) {
            // then fade it in and out
            const alpha = ease(1 - dt); // fade it out, it displays instantly as shots as sudden

            for (const shotSprite of this.shotSprites) {
                shotSprite.alpha = alpha;
            }
        }

        // if brawler is brawling
        if (this.brawlerAttack && this.brawlerAttack.visible) {
            this.brawlerAttack.rotation = randomRotation + Math.PI * dt * 2;
        }

        if (this.focusTiles.length > 0) {
            const focusScalar = this.game.settings.sharpshooterFocus.get();
            for (const focusTile of this.focusTiles) {
                if (focusScalar === 0) {
                    focusTile.sprite.visible = false;
                    continue; // no need to figure out alpha, as it's hidden
                } else {
                    focusTile.sprite.visible = true;
                }

                let alpha = 1;
                if (focusTile.fade === "in") {
                    alpha = dt;
                } else if (focusTile.fade === "out") {
                    alpha = 1 - dt;
                }

                focusTile.sprite.alpha = ease(alpha * focusScalar);
            }
        }
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Cowboy's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>

        // color the top of the sprite as the player's color
        const ownerColor = this.game.getPlayersColor(this.ownerID);
        this.spriteTop.tint = ownerColor.rgbNumber();
        this.healthBar.recolor(ownerColor.lighten(0.25));

        for (const focusSprite of this.allFocusSprites) {
            focusSprite.tint = this.spriteTop.tint;
        }

        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Cowboy instance should not be rendered,
     * such as going back in time before it existed.
     *
     * By default the super hides container.
     * If this sub class adds extra PIXI objects outside this.container, you
     * should hide those too in here.
     */
    public hideRender(): void {
        super.hideRender();

        // <<-- Creer-Merge: hide-render -->>
        for (const shotSprite of this.shotSprites) {
            shotSprite.visible = false;
        }

        for (const focusSprite of this.allFocusSprites) {
            focusSprite.visible = false;
        }

        if (this.brawlerAttack) {
            this.brawlerAttack.visible = false;
        }
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
        current: Immutable<CowboyState>,
        next: Immutable<CowboyState>,
        delta: Immutable<SaloonDelta>,
        nextDelta: Immutable<SaloonDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        this.playingPianoAt = undefined;

        // if the delta is a run that we did
        if (
            nextDelta.type === "ran" &&
            nextDelta.data.run.caller.id === this.id
        ) {
            const { run } = nextDelta.data;
            switch (this.job) {
                case "Sharpshooter":
                    if (
                        run.functionName === "act" &&
                        nextDelta.data.returned === true
                    ) {
                        // they successfully shot
                        this.showShot(
                            current.tile,
                            run.args.tile.getCurrentMostState(),
                            current.focus,
                        );
                    }
            }

            if (
                run.functionName === "play" &&
                nextDelta.data.returned === true
            ) {
                // then they played a piano
                this.playingPianoAt = run.args.piano.getCurrentMostState().tile;
            }
        } else {
            this.visibleShot(false);
        }

        if (this.job === "Brawler" && this.brawlerAttack) {
            const attacking = Boolean(
                nextDelta.type === "finished" &&
                    nextDelta.data.order.name === "runTurn" &&
                    nextDelta.data.player &&
                    nextDelta.data.player.id === next.owner.id,
            );

            this.brawlerAttack.visible = attacking;

            if (attacking) {
                const tile = current.tile || next.tile;
                if (tile) {
                    this.brawlerAttack.x = tile.x + 0.5;
                    this.brawlerAttack.y = tile.y + 0.5;
                } else {
                    // invalid order
                    this.brawlerAttack.visible = false;
                }
            }
        } else if (this.job === "Sharpshooter") {
            this.focusTiles.length = 0;
            this.reclaimFocusSprites();

            if (current.focus > 0 || next.focus > 0) {
                // then show its focus
                let fade: "in" | "out" | undefined; // no change
                if (current.focus > next.focus) {
                    // fade out
                    fade = "out";
                } else if (current.focus < next.focus) {
                    // fade in
                    fade = "in";
                }

                const distance = Math.max(current.focus, next.focus);
                for (const direction of TILE_DIRECTIONS) {
                    const tile = current.tile;

                    if (!tile) {
                        break;
                    }

                    for (let i = 0; i < distance; i++) {
                        const neighbor = getTileNeighbor(tile, direction);

                        if (!neighbor || neighbor.isBalcony) {
                            break; // off map
                        }

                        let thisFade = fade;
                        if (fade === "in") {
                            // fade in the new neighbor
                            thisFade = i === distance - 1 ? "in" : undefined;
                        }

                        const sprite = this.getFocusSprite();

                        sprite.visible = true;
                        sprite.x = neighbor.x;
                        sprite.y = neighbor.y;

                        this.focusTiles.push({
                            sprite,
                            fade: thisFade,
                        });
                    }
                }
            }
        }
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // <Joueur functions> --- functions invoked for human playable client
    // NOTE: These functions are only used 99% of the time if the game
    // supports human playable clients (like Chess).
    // If it does not, feel free to ignore these Joueur functions.

    /**
     * Does their job's action on a Tile.
     *
     * @param tile - The Tile you want this Cowboy to act on.
     * @param drunkDirection - The direction the bottle will cause drunk cowboys
     * to be in, can be 'North', 'East', 'South', or 'West'.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if the act worked, false
     * otherwise.
     */
    public act(
        tile: TileState,
        drunkDirection: "" | "North" | "East" | "South" | "West",
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("act", { tile, drunkDirection }, callback);
    }

    /**
     * Moves this Cowboy from its current Tile to an adjacent Tile.
     *
     * @param tile - The Tile you want to move this Cowboy to.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if the move worked, false
     * otherwise.
     */
    public move(tile: TileState, callback: (returned: boolean) => void): void {
        this.runOnServer("move", { tile }, callback);
    }

    /**
     * Sits down and plays a piano.
     *
     * @param piano - The Furnishing that is a piano you want to play.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if the play worked, false
     * otherwise.
     */
    public play(
        piano: FurnishingState,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("play", { piano }, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>

    /**
     * Gets a free focus sprite, or creates one.
     *
     * @returns A focus sprite to use to display a sharpshooter's focus.
     */
    private getFocusSprite(): PIXI.Sprite {
        const sprite = this.freeFocusSprites.pop();
        if (sprite) {
            return sprite;
        }

        // if we got here we need to make a new sprite
        const newSprite = this.game.resources.blank.newSprite({
            container: this.game.layers.background,
        });
        this.allFocusSprites.push(newSprite);

        newSprite.tint = this.spriteTop.tint; // team's color matrix filter

        return newSprite;
    }

    /**
     * Reclaims all used focus sprites and caches them for future reuse.
     */
    private reclaimFocusSprites(): void {
        this.freeFocusSprites.length = 0;
        for (const sprite of this.allFocusSprites) {
            sprite.visible = false;
            this.freeFocusSprites.push(sprite);
        }
    }

    /**
     * Displays all the shot sprites or not.
     *
     * @param show - True to show, false to hide.
     */
    private visibleShot(show: boolean): void {
        this.shotVisible = show;

        // hide all the shots by default
        for (const sprite of this.shotSprites) {
            sprite.visible = false;
        }
        // showShot will show the correct one(s)
    }

    /**
     * Displays a shot from a starting tile to and end tile.
     *
     * @param from - The tile the shot starts from.
     * @param to - The tile the shot goes to.
     * @param distance - The distance between the two tiles.
     */
    private showShot(
        from: Immutable<Point>,
        to: Immutable<Point>,
        distance: number,
    ): void {
        this.visibleShot(true);

        let dx = -(from.x - to.x);
        let dy = -(from.y - to.y);
        let rotation = 0;

        if (dx !== 0) {
            // shot to the West or East
            if (dx > 0) {
                // East
                dx = 1;
                rotation = Math.PI;
            } else {
                // dx < 0, West
                dx = -1;
            }
        } else {
            // dy !== 0, so shot to the North or South
            if (dy > 0) {
                // South
                dy = 1;
                rotation = Math.PI * 1.5;
            } else {
                // dy < 0, North
                dy = -1;
                rotation = Math.PI * 0.5;
            }
        }

        for (let i = 0; i < distance; i++) {
            let sprite = this.shotSprites[i];

            // if we didn't have one, make a new one and cache it
            if (!sprite) {
                sprite = this.game.resources.shotBody.newSprite({
                    container: this.game.layers.bullets,
                });
                sprite.anchor.set(0.5);
                this.shotSprites.push(sprite);
            }

            // now we know for sure we have a shot sprite
            sprite.visible = true;
            sprite.x = from.x + 0.5 + dx * (i + 1);
            sprite.y = from.y + 0.5 + dy * (i + 1);
            sprite.rotation = rotation;
        }
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}
