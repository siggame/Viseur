// This is a class to represent the Unit object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { Viseur } from "src/viseur";
import { IDeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { GameObject } from "./game-object";
import { ITileState, IUnitState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import * as Color from "color";
import { ease } from "src/utils";
// import { GameBar } from "src/viseur/game";
import { Player } from "./player";
// any additional imports you want can be added here safely between Creer runs
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

    public owner?: Player;

    public shipSprite: PIXI.Sprite;
    public pirateSprite: PIXI.Sprite;
    public dropShadow: PIXI.Sprite;

    public shirt: PIXI.Sprite;
    public flag: PIXI.Sprite;

    // private readonly healthBar: GameBar;
    // You can add additional member variables here
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
        if (state.owner) {
            this.owner = this.game.gameObjects[state.owner.id] as Player;
        }

        this.container.setParent(this.game.layers.game);

        this.shipSprite = this.game.resources.ship.newSprite(this.container);
        this.shipSprite.visible = false;

        this.pirateSprite = this.game.resources.pirate.newSprite(this.container);
        this.pirateSprite.visible = false;

        this.shirt = this.game.resources.shirt.newSprite(this.container);
        this.shirt.blendMode = 2; // multiply
        this.shirt.visible = false;

        this.flag = this.game.resources.flag.newSprite(this.container);
        this.flag.blendMode = 2; // multiply
        this.flag.visible = false;

        this.dropShadow = this.game.resources.dropShadow.newSprite(this.container);
        this.dropShadow.visible = false;

        if (state.tile) {
            this.container.position.set(state.tile.x, state.tile.y);
            this.container.visible = true;
        }
        else {
            this.container.position.set(-1, -1);
            this.container.visible = false;
        }

        this.recolor();

        // this.healthBar = new GameBar(this.container);
        // You can initialize your new Unit here.
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
        if (next.tile == null) {
            this.container.visible = false;
            return;
        }
        else {
            this.container.visible = true;
        }
        if (current.crewHealth > 0) {
            this.pirateSprite.visible = true;
            this.shirt.visible = true;
            this.flag.visible = false;
            this.shipSprite.visible = false;
        }
        if (current.shipHealth > 0) {
            this.shipSprite.visible = true;
            this.flag.visible = true;
            this.shirt.visible = false;
            this.pirateSprite.visible = false;
        }

        const cX = current.tile.x;
        const nX = next.tile.x;

        this.container.position.set(
            ease(cX, nX, dt),
            ease(current.tile.y, next.tile.y, dt),
        );
        // render where the Unit is
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this Unit's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        if (!this.owner) {
            const white = Color("white");
            this.shirt.tint = white.rgbNumber();
            this.flag.tint = white.rgbNumber();
            return;
        }
        const ownerColor = this.game.getPlayersColor(this.owner);
        this.shirt.tint = ownerColor.rgbNumber();
        this.flag.tint = ownerColor.rgbNumber();
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
    public stateUpdated(current: IUnitState, next: IUnitState,
                        reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        // update the Unit based off its states
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
     * Attacks either the 'crew' or 'ship' on a Tile in range.
     * @param tile The Tile to attack.
     * @param target Whether to attack 'crew' or 'ship'. Crew deal damage to
     * crew and ships deal damage to ships. Consumes any remaining moves.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully attacked,
     * false otherwise.
     */
    public attack(tile: ITileState, target: string, callback?: (returned:
                  boolean) => void,
    ): void {
        this.runOnServer("attack", {tile, target}, callback);
    }

    /**
     * Buries gold on this Unit's Tile. Gold must be a certain distance away for
     * it to get interest (Game.minInterestDistance).
     * @param amount How much gold this Unit should bury. Amounts <= 0 will bury
     * as much as possible.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully buried,
     * false otherwise.
     */
    public bury(amount: number, callback?: (returned: boolean) => void): void {
        this.runOnServer("bury", {amount}, callback);
    }

    /**
     * Puts gold into an adjacent Port. If that Port is the Player's port, the
     * gold is added to that Player. If that Port is owned by merchants, it adds
     * to that Port's investment.
     * @param amount The amount of gold to deposit. Amounts <= 0 will deposit
     * all the gold on this Unit.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully deposited,
     * false otherwise.
     */
    public deposit(amount: number, callback?: (returned: boolean) => void): void {
        this.runOnServer("deposit", {amount}, callback);
    }

    /**
     * Digs up gold on this Unit's Tile.
     * @param amount How much gold this Unit should take. Amounts <= 0 will dig
     * up as much as possible.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully dug up,
     * false otherwise.
     */
    public dig(amount: number, callback?: (returned: boolean) => void): void {
        this.runOnServer("dig", {amount}, callback);
    }

    /**
     * Moves this Unit from its current Tile to an adjacent Tile. If this Unit
     * merges with another one, the other Unit will be destroyed and its tile
     * will be set to null. Make sure to check that your Unit's tile is not null
     * before doing things with it.
     * @param tile The Tile this Unit should move to.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if it moved, false
     * otherwise.
     */
    public move(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("move", {tile}, callback);
    }

    /**
     * Regenerates this Unit's health. Must be used in range of a port.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully rested,
     * false otherwise.
     */
    public rest(callback?: (returned: boolean) => void): void {
        this.runOnServer("rest", {}, callback);
    }

    /**
     * Moves a number of crew from this Unit to the given Tile. This will
     * consume a move from those crew.
     * @param tile The Tile to move the crew to.
     * @param amount The number of crew to move onto that Tile. Amount <= 0 will
     * move all the crew to that Tile.
     * @param gold The amount of gold the crew should take with them. Gold < 0
     * will move all the gold to that Tile.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully split,
     * false otherwise.
     */
    public split(tile: ITileState, amount: number, gold: number, callback?:
                 (returned: boolean) => void,
    ): void {
        this.runOnServer("split", {tile, amount, gold}, callback);
    }

    /**
     * Takes gold from the Player. You can only withdraw from your own Port.
     * @param amount The amount of gold to withdraw. Amounts <= 0 will withdraw
     * everything.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully withdrawn,
     * false otherwise.
     */
    public withdraw(amount: number, callback?: (returned: boolean) => void): void {
        this.runOnServer("withdraw", {amount}, callback);
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
