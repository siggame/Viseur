// This is a class to represent the Unit object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { IDeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { GameObject } from "./game-object";
import { ITileState, IUnitState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
import * as Color from "color";
import { ease, updown } from "src/utils"; // updown
import { GameBar } from "src/viseur/game";
import { Player } from "./player";
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class Unit extends GameObject {
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
        return true; // change this to true to render all instances of this class
        // <<-- /Creer-Merge: should-render -->>
    }

    /** The instance of the game this game object is a part of */
    public readonly game: Game;

    /** The current state of the Unit (dt = 0) */
    public current: IUnitState;

    /** The next state of the Unit (dt = 1) */
    public next: IUnitState;

    // <<-- Creer-Merge: variables -->>
    // You can add additional member variables here
    // Owner of the unit
    public owner?: Player;
    public job: string;

    // Base sprite of the unit
    public catSprite: PIXI.Sprite;
    public humanSprite: PIXI.Sprite;
    public builderSprite: PIXI.Sprite;
    public soldierSprite: PIXI.Sprite;
    public gathererSprite: PIXI.Sprite;
    public converterSprite: PIXI.Sprite;

    public spriteInUse: PIXI.Sprite;

    // State Change Variables
    public attackingTile?: ITileState;
    public jobChanged?: string;
    public playerChange?: string;

    // "Drop shadow" sprite
    public dropShadow: PIXI.Sprite;

    public maxEnergy: number;
    /** The bar that display's this unit's health */
    private readonly healthBar: GameBar;

    // "Visible" variable
    // public visible: boolean;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Unit with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this Unit
     * @param game the game this Unit is in
     */
    constructor(state: IUnitState, game: Game) {
        super(state, game);

        // <<-- Creer-Merge: constructor -->>

        if (state.owner) {
            this.owner = this.game.gameObjects[state.owner.id] as Player;
        }
        this.job = state.job.title;

        this.container.setParent(this.game.layers.game);

        this.dropShadow = this.game.resources.dropShadow.newSprite(this.container);

        this.catSprite = this.game.resources.catOverlord.newSprite(this.container);
        this.catSprite.visible = false;
        this.soldierSprite = this.game.resources.soldierUnit.newSprite(this.container);
        this.soldierSprite.visible = false;
        this.gathererSprite = this.game.resources.gathererUnit.newSprite(this.container);
        this.gathererSprite.visible = false;
        this.builderSprite = this.game.resources.builderHuman.newSprite(this.container);
        this.builderSprite.visible = false;
        this.converterSprite = this.game.resources.converterUnit.newSprite(this.container);
        this.converterSprite.visible = false;
        this.humanSprite = this.game.resources.freshHuman.newSprite(this.container);
        this.humanSprite.visible = false;

        this.set_job(this.job);

        if (state.owner && state.owner.id === "1") {
            this.spriteInUse.anchor.x = 1;
            this.spriteInUse.scale.x *= -1;
        }

        if (state.tile) {
            this.container.position.set(state.tile.x, state.tile.y);
            this.container.visible = true;
        }
        else {
            this.container.position.set(-1, -1);
            this.container.visible = false;
        }
        this.recolor();

        this.maxEnergy = state.energy;
        this.healthBar = new GameBar(this.container);

        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Unit
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
    public render(dt: number, current: IUnitState, next: IUnitState,
                  reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>

        // No longer on the map
        if (next.tile == null) {
            this.container.visible = false;
            return;
        }
        else {
            this.container.visible = true;
        }

        this.container.position.set(
            ease(current.tile.x, next.tile.x, dt),
            ease(current.tile.y, next.tile.y, dt),
        );



        // Owner Change
        if (current.owner !== next.owner) {
            if (current.owner && current.owner.id === "1" && this.owner && current.owner.id !== this.owner.id) {
                this.spriteInUse.anchor.x = 0;
                this.spriteInUse.scale.x *= -1;
            }
            if (next.owner) {
                if ((this.owner === undefined) || (this.owner.id !== next.owner.id)) {
                    if (next.owner.id === "1") {
                        this.spriteInUse.x = 1;
                        this.spriteInUse.scale.x *= -1;
                    }
                }
                this.owner = this.game.gameObjects[next.owner.id] as Player;
            }
            else {
                this.owner = undefined;
            }

            this.recolor();
        }

        if (this.jobChanged) { // If Job Changed called by player and returned true
            if (this.jobChanged !== this.job) {
                this.set_job(this.jobChanged);
            }
        }
        else { // This would be a unit losing loyalty/ or the game state jumps
            if (this.job !== next.job.title) {
                this.set_job(next.job.title);
            }
        }

        let currEnergy;
        let nextEnergy;
        if (this.job === "fresh human") {
            currEnergy = current.turnsToDie / 10; // Magic number 10 is max turns to die
            nextEnergy = next.turnsToDie / 10;
        }
        else {
            currEnergy = current.energy / this.maxEnergy;
            nextEnergy = next.energy / this.maxEnergy;
        }
        this.healthBar.update(ease(currEnergy, nextEnergy, dt));

        /* This is broke right now */
        if (this.attackingTile) {
            const d = updown(dt);
            const dx = (this.attackingTile.x - current.tile.x) / 2;
            const dy = (this.attackingTile.y - current.tile.y) / 2;

            this.container.x += dx * d;
            this.container.y += dy * d;
        }/**/


        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this Unit's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        if (this.owner === undefined) {
            const white = Color("white");
            this.dropShadow.tint = white.rgbNumber();
            return;
        }
        const ownerColor = this.game.getPlayersColor(this.owner);
        this.dropShadow.tint = ownerColor.rgbNumber();
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
    public stateUpdated(current: IUnitState, next: IUnitState,
                        reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        this.attackingTile = undefined;
        this.jobChanged = undefined;
        if (nextReason && nextReason.run && nextReason.run.caller === this) {
            const run = nextReason.run;
            if (run.functionName === "attack" && nextReason.returned === true) {
                this.attackingTile = nextReason.run.args.tile;
            }
            else if (run.functionName === "changeJob" && nextReason.returned === true) {
                this.jobChanged = run.args.job;
            }
            else if (run.functionName !== "move" && nextReason.returned === true) {
                console.log(run.functionName);
            }
        }
            // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here

    public set_job(job: string): void {
        if (this.spriteInUse) {
            this.spriteInUse.visible = false;
        }
        // job strings taken from game rules at
        // https://github.com/siggame/Cadre-MegaMinerAI-Dev/blob/master/Games/Catastrophe/rules.md
        if (job === "cat overlord") {
            this.spriteInUse = this.catSprite;
        }
        if (job === "soldier") {
            this.spriteInUse = this.soldierSprite;
        }
        if (job === "gatherer") {
            this.spriteInUse = this.gathererSprite;
        }
        if (job === "builder") {
            this.spriteInUse = this.builderSprite;
        }
        if (job === "missionary") {
            this.spriteInUse = this.converterSprite;
        }
        if (job === "fresh human") {
            this.spriteInUse = this.humanSprite;
        }
        this.job = job;
        this.spriteInUse.visible = true;
    }

    // <<-- /Creer-Merge: public-functions -->>

    // NOTE: past this block are functions only used 99% of the time if
    //       the game supports human playable clients (like Chess).
    //       If it does not, feel free to ignore everything past here.

    // <Joueur functions> --- functions invoked for human playable client

    /**
     * Attacks an adjacent Tile. Costs an action for each Unit in this Unit's
     * squad. Units in the squad without an action don't participate in combat.
     * Units in combat cannot move afterwards.
     * @param tile The Tile to attack.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully attacked,
     * false otherwise.
     */
    public attack(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("attack", {tile}, callback);
    }

    /**
     * Changes this Unit's Job. Must be at max energy (100.0) to change Jobs.
     * @param job The name of the Job to change to.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully changed
     * Jobs, false otherwise.
     */
    public changeJob(job: string, callback?: (returned: boolean) => void): void {
        this.runOnServer("changeJob", {job}, callback);
    }

    /**
     * Constructs a Structure on an adjacent Tile.
     * @param tile The Tile to construct the Structure on. It must have enough
     * materials on it for a Structure to be constructed.
     * @param type The type of Structure to construct on that Tile.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully constructed
     * a structure, false otherwise.
     */
    public construct(tile: ITileState, type: string, callback?: (returned:
                     boolean) => void,
    ): void {
        this.runOnServer("construct", {tile, type}, callback);
    }

    /**
     * Converts an adjacent Unit to your side.
     * @param tile The Tile with the Unit to convert.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully converted,
     * false otherwise.
     */
    public convert(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("convert", {tile}, callback);
    }

    /**
     * Removes materials from an adjacent Tile's Structure. Soldiers do not gain
     * materials from doing this, but can deconstruct friendly Structures as
     * well.
     * @param tile The Tile to deconstruct. It must have a Structure on it.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully
     * deconstructed, false otherwise.
     */
    public deconstruct(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("deconstruct", {tile}, callback);
    }

    /**
     * Drops some of the given resource on or adjacent to the Unit's Tile. Does
     * not count as an action.
     * @param tile The Tile to drop materials/food on.
     * @param resource The type of resource to drop ('material' or 'food').
     * @param amount The amount of the resource to drop. Amounts <= 0 will drop
     * as much as possible.
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
     * Harvests the food on an adjacent Tile.
     * @param tile The Tile you want to harvest.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully harvested,
     * false otherwise.
     */
    public harvest(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("harvest", {tile}, callback);
    }

    /**
     * Moves this Unit from its current Tile to an adjacent Tile.
     * @param tile The Tile this Unit should move to.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if it moved, false
     * otherwise.
     */
    public move(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("move", {tile}, callback);
    }

    /**
     * Picks up some materials or food on or adjacent to the Unit's Tile. Does
     * not count as an action.
     * @param tile The Tile to pickup materials/food from.
     * @param resource The type of resource to pickup ('material' or 'food').
     * @param amount The amount of the resource to pickup. Amounts <= 0 will
     * pickup as much as possible.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully picked up a
     * resource, false otherwise.
     */
    public pickup(tile: ITileState, resource: string, amount: number, callback?:
                  (returned: boolean) => void,
    ): void {
        this.runOnServer("pickup", {tile, resource, amount}, callback);
    }

    /**
     * Regenerates energy. Must be in range of a friendly shelter to rest. Costs
     * an action. Units cannot move after resting.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully rested,
     * false otherwise.
     */
    public rest(callback?: (returned: boolean) => void): void {
        this.runOnServer("rest", {}, callback);
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
