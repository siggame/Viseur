// This is a class to represent the Beaver object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { Viseur } from "src/viseur";
import { IDeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { GameObject } from "./game-object";
import { IBeaverState, ISpawnerState, ITileState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import { ease, updown } from "src/utils";
import { GameBar } from "src/viseur/game";
import { RendererResource } from "src/viseur/renderer";
import { Player } from "./player";
import { Spawner } from "./spawner";
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class Beaver extends GameObject {
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

    /** The current state of the Beaver (dt = 0) */
    public current: IBeaverState | undefined;

    /** The next state of the Beaver (dt = 1) */
    public next: IBeaverState | undefined;

    // <<-- Creer-Merge: variables -->>

    /** The owning player */
    private readonly owner: Player;

    /** The beaver this is attacking, if any */
    private attacking?: Beaver;

    /** The spawner this is harvesting, if any */
    private harvesting?: Spawner;

    /** The tail part of our sprite stack */
    private readonly tailSprite: PIXI.Sprite;

    /** Sprite indicating that we are attacking something */
    private readonly attackingSprite: PIXI.Sprite;

    /** Sprite indicating that we are getting branches */
    private readonly gettingBranchSprite: PIXI.Sprite;

    /** Sprite indicating that we are getting food */
    private readonly gettingFoodSprite: PIXI.Sprite;

    /** Sprite indicating that we are distracted */
    private readonly distractedSprite: PIXI.Sprite;

    /** The bar that displays our health */
    private readonly healthBar: GameBar;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Beaver with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this Beaver
     * @param Visuer the Viseur instance that controls everything and contains
     * the game.
     */
    constructor(state: IBeaverState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>

        this.owner = this.game.gameObjects[state.owner.id] as any; // we know for certain the player will be there

        // the "bottom" of the beaver, which is the body, is based on team id, either 0 or 1.
        const bottomResource = state.owner.id === "0"
            ? this.game.resources.beaver0
            : this.game.resources.beaver1;

        bottomResource.newSprite(this.container);
        this.tailSprite = this.game.resources.beaverTail.newSprite(this.container);

        if (state.job.title !== "Basic") {
            const jobTitle = state.job.title.replace(" ", "");
            const jobResource = (this.game.resources[`job${jobTitle}`] as RendererResource); // sketchy

            jobResource.newSprite(this.container);
        }

        this.attackingSprite = this.game.resources.attacking.newSprite(this.container);
        this.gettingBranchSprite = this.game.resources.gettingBranch.newSprite(this.container);
        this.gettingFoodSprite = this.game.resources.gettingFood.newSprite(this.container);
        this.distractedSprite = this.game.resources.distracted3.newSprite(this.container);

        this.healthBar = new GameBar(this.container, {
            max: state.job.health,
            visibilitySetting: this.game.settings.displayHealthBars,
        });

        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Beaver
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
    public render(dt: number, current: IBeaverState, next: IBeaverState,
                  reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>

        if (current.health === 0) {  // Then beaver is dead.
            this.container.visible = false;
            return; // No need to render a dead beaver.
        }

        // otherwise, we have a (maybe) happy living beaver
        this.container.visible = true;

        const currentTile = current.tile;
        let nextTile = next.tile;

        if (current.health > 0 && next.health <= 0) {
            // The Beaver died between current and next.

            // Dead beavers have no tile in their next state,
            // so use the one they had before.
            nextTile = currentTile;
            this.container.alpha = ease(1 - dt, "cubicInOut"); // fade the beaver sprite
        }
        else {
            this.container.alpha = 1; // ITS ALIVE
        }

        // update their health bar, if they want it to be displayed
        this.healthBar.update(
            ease(current.health, next.health, dt, "cubicInOut"),
        );

        // render the beaver easing the transition from their current tile to their next tile
        this.container.x = ease(currentTile.x, nextTile.x, dt, "cubicInOut");
        this.container.y = ease(currentTile.y, nextTile.y, dt, "cubicInOut");

        // update its status bubbles
        this.attackingSprite.visible = false;
        this.gettingBranchSprite.visible = false;
        this.gettingFoodSprite.visible = false;
        this.distractedSprite.visible = current.turnsDistracted > 0;

        let bumpInto: undefined | ITileState; // Find something to bump into

        if (this.attacking) {
            this.attackingSprite.visible = true;
            bumpInto = (this.attacking.current || this.attacking.next)!.tile;
        }
        else if (this.harvesting) {
            const harvesting = this.harvesting.current || this.harvesting.next!;
            if (harvesting.type === "food") {
                this.gettingFoodSprite.visible = true;
            }
            else { // tree branches
                this.gettingBranchSprite.visible = true;
            }

            bumpInto = harvesting.tile;
        }

        // if we found something to bump into, animate it bumping into it half way
        if (bumpInto) {
            const d = updown(dt);
            const dx = (bumpInto.x - current.tile.x) / 2;
            const dy = (bumpInto.y - current.tile.y) / 2;

            this.container.x += dx * d;
            this.container.y += dy * d;
        }

        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this Beaver's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        const color = this.game.getPlayersColor(this.owner);
        this.tailSprite.tint = color.lighten(0.15).rgbNumber();
        this.healthBar.recolor(color.lighten(0.5));
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
    public stateUpdated(current: IBeaverState, next: IBeaverState,
                        reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        this.attacking = undefined;
        this.harvesting = undefined;

        if (nextReason && nextReason.run && nextReason.run.caller.id === this.id) {
            const run = nextReason.run;

            if (run.functionName === "attack" && nextReason.returned) {
                // This beaver gonna fite sumthin
                this.attacking = run.args.beaver;
            }

            if (run.functionName === "harvest" && nextReason.returned) {
                // This beaver getting some food!
                this.harvesting = run.args.spawner;
            }

        }
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // NOTE: past this block are functions only used 99% of the time if
    //       the game supports human playable clients (like Chess).
    //       If it does not, feel free to ignore everything past here.

    // <Joueur functions> --- functions invoked for human playable client

    /**
     * Attacks another adjacent beaver.
     * @param beaver The Beaver to attack. Must be on an adjacent Tile.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully attacked,
     * false otherwise.
     */
    public attack(beaver: IBeaverState, callback?: (returned: boolean) => void): void {
        this.runOnServer("attack", {beaver}, callback);
    }

    /**
     * Builds a lodge on the Beavers current Tile.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully built a
     * lodge, false otherwise.
     */
    public buildLodge(callback?: (returned: boolean) => void): void {
        this.runOnServer("buildLodge", {}, callback);
    }

    /**
     * Drops some of the given resource on the beaver's Tile.
     * @param tile The Tile to drop branches/food on. Must be the same Tile that
     * the Beaver is on, or an adjacent one.
     * @param resource The type of resource to drop ('branch' or 'food').
     * @param amount The amount of the resource to drop, numbers <= 0 will drop
     * all the resource type.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully dropped the
     * resource, false otherwise.
     */
    public drop(tile: ITileState, resource: string, amount: number, callback?:
                (returned: boolean) => void,
    ): void {
        this.runOnServer("drop", {tile, resource, amount}, callback);
    }

    /**
     * Harvests the branches or food from a Spawner on an adjacent Tile.
     * @param spawner The Spawner you want to harvest. Must be on an adjacent
     * Tile.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully harvested,
     * false otherwise.
     */
    public harvest(spawner: ISpawnerState, callback?: (returned: boolean) =>
                   void,
    ): void {
        this.runOnServer("harvest", {spawner}, callback);
    }

    /**
     * Moves this Beaver from its current Tile to an adjacent Tile.
     * @param tile The Tile this Beaver should move to.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if the move worked, false
     * otherwise.
     */
    public move(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("move", {tile}, callback);
    }

    /**
     * Picks up some branches or food on the beaver's tile.
     * @param tile The Tile to pickup branches/food from. Must be the same Tile
     * that the Beaver is on, or an adjacent one.
     * @param resource The type of resource to pickup ('branch' or 'food').
     * @param amount The amount of the resource to drop, numbers <= 0 will
     * pickup all of the resource type.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully picked up a
     * resource, false otherwise.
     */
    public pickup(tile: ITileState, resource: string, amount: number, callback?:
                  (returned: boolean) => void,
    ): void {
        this.runOnServer("pickup", {tile, resource, amount}, callback);
    }

    // </Joueur functions>

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
