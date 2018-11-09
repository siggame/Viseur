// This is a class to represent the Unit object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { Viseur } from "src/viseur";
import { IDeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { GameObject } from "./game-object";
import { ITileState, IUnitState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
// import * as Color from "color";
import { ease, updown } from "src/utils";
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
    public readonly game!: Game; // set in super constructor

    /** The current state of the Unit (dt = 0) */
    public current: IUnitState | undefined;

    /** The next state of the Unit (dt = 1) */
    public next: IUnitState | undefined;

    // <<-- Creer-Merge: variables -->>
    // You can add additional member variables here
    public owner: Player;
    // Job of unit. contains the string of their job title.
    public job: string;

    public internSprite: PIXI.Sprite;
    public managerSprite: PIXI.Sprite;
    public physicistSprite: PIXI.Sprite;

    public spriteInUse: PIXI.Sprite | undefined;
    public indicatorSprite: PIXI.Sprite;
    public attackingTile?: ITileState;

    public maxHealth: number;
    public readonly healthBar: GameBar;

    public barContainer: PIXI.Container;

    public facing: string;
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Unit with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this Unit
     * @param Visuer the Viseur instance that controls everything and contains
     * the game.
     */
    constructor(state: IUnitState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        // You can initialize your new Unit here.
        this.owner = this.game.gameObjects[state.owner.id] as Player;
        this.job = state.job.title;
        this.container.setParent(this.game.layers.game);
        this.container.scale.x = 1.1;
        this.container.scale.y = 1.1;
        this.internSprite = this.game.resources.intern.newSprite(this.container);
        this.internSprite.visible = false;
        this.physicistSprite = this.game.resources.physicist.newSprite(this.container);
        this.physicistSprite.visible = false;
        this.managerSprite = this.game.resources.manager.newSprite(this.container);
        this.managerSprite.visible = false;
        this.indicatorSprite = this.game.resources.indicator.newSprite(this.container);
        this.indicatorSprite.visible = false;
        if (state.tile) {
            this.container.position.set(state.tile.x, state.tile.y);
            this.container.visible = true;
        }
        else {
            this.container.position.set(-1, -1);
            this.container.visible = false;
        }
        this.barContainer = new PIXI.Container();
        this.barContainer.setParent(this.container);
        this.barContainer.position.y -= 0.15;
        this.recolor();
        this.set_job(this.job);
        this.spriteInUse!.position.x -= .05;

        this.facing = "left";
        if (this.owner && this.owner.id === "0") {
            this.facing = "right";
            this.spriteInUse!.scale.x *= -1;
            this.spriteInUse!.anchor.x += 1;
        }
        this.maxHealth = state.job.health;
        this.healthBar = new GameBar(this.barContainer);
        this.healthBar.recolor(this.game.getPlayersColor(this.owner));
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
        // render where the Unit is

        // No longer on the map.
        if (next.tile == null) {
            this.container.visible = false;
            return;
        }
        else {
            this.container.visible = true;
        }

        if (current.tile.tileWest && current.tile.tileWest.id === next.tile.id) {
            if (this.facing !== "left") {
                this.facing = "left";
                this.spriteInUse!.scale.x *= -1;
                this.spriteInUse!.anchor.x -= 1;
            }
        }
        if (current.tile.tileEast && current.tile.tileEast.id === next.tile.id) {
            if (this.facing !== "right") {
                this.facing = "right";
                this.spriteInUse!.scale.x *= -1;
                this.spriteInUse!.anchor.x += 1;
            }
        }
        this.container.position.set(
            ease(current.tile.x, next.tile.x, dt),
            ease(current.tile.y, next.tile.y, dt),
        );

      //  let curHealth;
      //  let nextHealth;
      //  curHealth = current.health / this.maxHeath;
      //  nextHealth = next.health / this.maxHeath;

        this.healthBar.update(ease(current.health / this.maxHealth, next.health / this.maxHealth, dt));

        if (this.attackingTile) {

            const d = updown(dt);
            const dx = (this.attackingTile.x - current.tile.x) / 2;
            const dy = (this.attackingTile.y - current.tile.y) / 2;

            this.container.x += dx * d;
            this.container.y += dy * d;
        }

        this.healthBar.recolor(this.game.getPlayersColor(this.owner));

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
       //  const ownerColor = this.game.getPlayersColor(this.owner);
        // if (this.spriteInUse) {
        // this.spriteInUse.tint = ownerColor.rgbNumber();
        // }

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
        // update the Unit based off its states
        this.attackingTile = undefined;
        this.indicatorSprite.visible = false;
        if (nextReason && nextReason.run && nextReason.run.caller === this) {
            const run = nextReason.run;
            if (nextReason.returned === true) {
                switch (run.functionName) {
                    case "attack":
                        this.attackingTile = nextReason.run.args.tile;
                        break;
                    case "act":
                        if (run.args.tile.next) {
                            this.indicatorSprite.visible = true;
                        }
                        break;
                    default:
                }
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
        switch (job) {
            case "intern":
                this.spriteInUse = this.internSprite;
                break;
            case "physicist":
                this.spriteInUse = this.physicistSprite;
                break;
            case "manager":
                this.spriteInUse = this.managerSprite;
                break;
        }
        this.job = job;
        this.spriteInUse!.visible = true;
    }
    // <<-- /Creer-Merge: public-functions -->>

    // NOTE: past this block are functions only used 99% of the time if
    //       the game supports human playable clients (like Chess).
    //       If it does not, feel free to ignore everything past here.

    // <Joueur functions> --- functions invoked for human playable client

    /**
     * Makes the unit do something to a machine adjacent to its tile. Interns
     * sabotage, physicists work. Interns stun physicist, physicist stuns
     * manager, manager stuns intern.
     * @param tile The tile the unit acts on.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully acted,
     * false otherwise.
     */
    public act(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("act", {tile}, callback);
    }

    /**
     * Attacks a unit on an adjacent tile.
     * @param tile The Tile to attack.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully attacked,
     * false otherwise.
     */
    public attack(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("attack", {tile}, callback);
    }

    /**
     * Drops materials at the units feet or adjacent tile.
     * @param tile The tile the materials will be dropped on.
     * @param amount The number of materials to dropped. Amounts <= 0 will drop
     * all the materials.
     * @param material The material the unit will drop. 'redium', 'blueium',
     * 'redium ore', or 'blueium ore'.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully deposited,
     * false otherwise.
     */
    public drop(tile: ITileState, amount: number, material: string, callback?:
                (returned: boolean) => void,
    ): void {
        this.runOnServer("drop", {tile, amount, material}, callback);
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
     * Picks up material at the units feet or adjacent tile.
     * @param tile The tile the materials will be picked up from.
     * @param amount The amount of materials to pick up. Amounts <= 0 will pick
     * up all the materials that the unit can.
     * @param material The material the unit will pick up. 'redium', 'blueium',
     * 'redium ore', or 'blueium ore'.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully deposited,
     * false otherwise.
     */
    public pickup(tile: ITileState, amount: number, material: string, callback?:
                  (returned: boolean) => void,
    ): void {
        this.runOnServer("pickup", {tile, amount, material}, callback);
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
