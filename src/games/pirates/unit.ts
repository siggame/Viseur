// This is a class to represent the Unit object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { PiratesDelta, TileState, UnitState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import * as Color from "color";
import { ease } from "src/utils";

const WHITE_COLOR = Color("white").rgbNumber();
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
// Set this variable to `true`, if this class should render.
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Unit extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Unit (dt = 0). */
    public current: UnitState | undefined;

    /** The next state of the Unit (dt = 1). */
    public next: UnitState | undefined;

    // <<-- Creer-Merge: variables -->>

    /** If we have an owner, it's ID. */
    public ownerID?: string;

    /** The sprite of the ship, if we are that. */
    public shipSprite: PIXI.Sprite;

    /** The sprite of the pirate, if we are one. */
    public pirateSprite: PIXI.Sprite;

    /** The drop shadow effect. */
    public dropShadow: PIXI.Sprite;

    /** Our shirt to recolor. */
    public shirt: PIXI.Sprite;

    /** Our pirate ship flag to recolor. */
    public flag: PIXI.Sprite;

    // private readonly healthBar: GameBar;
    // You can add additional member variables here
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Unit with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Unit.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: UnitState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        this.container.setParent(this.game.layers.game);
        this.ownerID = state.owner && state.owner.id;

        const hide = { visible: true };
        this.shipSprite = this.addSprite.ship(hide);
        this.shipSprite.visible = false;

        this.pirateSprite = this.addSprite.pirate(hide);
        this.pirateSprite.visible = false;

        const shirtFlag = {
            ...hide,
            blendMode: 2, // multiply
        };
        this.shirt = this.addSprite.shirt(shirtFlag);
        this.flag = this.addSprite.flag(shirtFlag);

        this.dropShadow = this.addSprite.dropShadow(hide);

        if (state.tile) {
            this.container.position.set(state.tile.x, state.tile.y);
            this.container.visible = true;
        } else {
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
        current: Immutable<UnitState>,
        next: Immutable<UnitState>,
        delta: Immutable<PiratesDelta>,
        nextDelta: Immutable<PiratesDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        if (!next.tile) {
            this.container.visible = false;

            return;
        }

        this.container.visible = true;

        if (current.owner !== next.owner) {
            this.ownerID = next.owner.id;
            this.recolor();
        }

        if (current.crewHealth > 0) {
            this.pirateSprite.visible = true;
            this.shirt.visible = true;
            this.flag.visible = false;
            this.shipSprite.visible = false;
        } else {
            this.pirateSprite.visible = false;
            this.shirt.visible = false;
        }

        if (current.shipHealth > 0) {
            this.shipSprite.visible = true;
            this.flag.visible = true;
            this.shirt.visible = false;
            this.pirateSprite.visible = false;
        } else {
            this.shipSprite.visible = false;
            this.flag.visible = false;
        }

        if (next.crewHealth <= 0) {
            this.shipSprite.visible = false;
            this.flag.visible = false;
        }
        if (next.shipHealth <= 0) {
            this.pirateSprite.visible = false;
            this.shirt.visible = false;
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
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Unit's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        const color =
            this.ownerID === undefined
                ? WHITE_COLOR
                : this.game.getPlayersColor(this.ownerID).rgbNumber();

        this.shirt.tint = color;
        this.flag.tint = color;
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Unit instance should not be rendered,
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
        current: Immutable<UnitState>,
        next: Immutable<UnitState>,
        delta: Immutable<PiratesDelta>,
        nextDelta: Immutable<PiratesDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Unit based off its states
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
     * Attacks either the 'crew' or 'ship' on a Tile in range.
     *
     * @param tile - The Tile to attack.
     * @param target - Whether to attack 'crew' or 'ship'. Crew deal damage to
     * crew and ships deal damage to ships. Consumes any remaining moves.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully attacked,
     * false otherwise.
     */
    public attack(
        tile: TileState,
        target: "crew" | "ship",
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("attack", { tile, target }, callback);
    }

    /**
     * Buries gold on this Unit's Tile. Gold must be a certain distance away for
     * it to get interest (Game.minInterestDistance).
     *
     * @param amount - How much gold this Unit should bury. Amounts <= 0 will
     * bury as much as possible.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully buried,
     * false otherwise.
     */
    public bury(amount: number, callback: (returned: boolean) => void): void {
        this.runOnServer("bury", { amount }, callback);
    }

    /**
     * Puts gold into an adjacent Port. If that Port is the Player's port, the
     * gold is added to that Player. If that Port is owned by merchants, it adds
     * to that Port's investment.
     *
     * @param amount - The amount of gold to deposit. Amounts <= 0 will deposit
     * all the gold on this Unit.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully deposited,
     * false otherwise.
     */
    public deposit(
        amount: number,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("deposit", { amount }, callback);
    }

    /**
     * Digs up gold on this Unit's Tile.
     *
     * @param amount - How much gold this Unit should take. Amounts <= 0 will
     * dig up as much as possible.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully dug up,
     * false otherwise.
     */
    public dig(amount: number, callback: (returned: boolean) => void): void {
        this.runOnServer("dig", { amount }, callback);
    }

    /**
     * Moves this Unit from its current Tile to an adjacent Tile. If this Unit
     * merges with another one, the other Unit will be destroyed and its tile
     * will be set to null. Make sure to check that your Unit's tile is not null
     * before doing things with it.
     *
     * @param tile - The Tile this Unit should move to.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if it moved, false
     * otherwise.
     */
    public move(tile: TileState, callback: (returned: boolean) => void): void {
        this.runOnServer("move", { tile }, callback);
    }

    /**
     * Regenerates this Unit's health. Must be used in range of a port.
     *
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully rested,
     * false otherwise.
     */
    public rest(callback: (returned: boolean) => void): void {
        this.runOnServer("rest", {}, callback);
    }

    /**
     * Moves a number of crew from this Unit to the given Tile. This will
     * consume a move from those crew.
     *
     * @param tile - The Tile to move the crew to.
     * @param amount - The number of crew to move onto that Tile. Amount <= 0
     * will move all the crew to that Tile.
     * @param gold - The amount of gold the crew should take with them. Gold < 0
     * will move all the gold to that Tile.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully split,
     * false otherwise.
     */
    public split(
        tile: TileState,
        amount: number,
        gold: number,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("split", { tile, amount, gold }, callback);
    }

    /**
     * Takes gold from the Player. You can only withdraw from your own Port.
     *
     * @param amount - The amount of gold to withdraw. Amounts <= 0 will
     * withdraw everything.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully withdrawn,
     * false otherwise.
     */
    public withdraw(
        amount: number,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("withdraw", { amount }, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
