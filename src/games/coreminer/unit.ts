// This is a class to represent the Unit object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { CoreminerDelta, ITileState, IUnitState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// <<-- Creer-Merge: imports -->>
import { ease, pixiFade , updown } from "src/utils";
import { GameBar } from "src/viseur/game";
const OVER_SCALE = 0.1;
// any additional imports you want can be added here safely between Creer runs
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

    /** The current state of the Unit (dt = 0) */
    public current: IUnitState | undefined;

    /** The next state of the Unit (dt = 1) */
    public next: IUnitState | undefined;

    // <<-- Creer-Merge: variables -->>

    public readonly miner: PIXI.Sprite | undefined;

    public readonly bomb: PIXI.Sprite | undefined;

    /** The id of the owner of this unit, for recoloring */
    public ownerID: string;

    /** The tile state of the tile we are attacking, if we are. */
    public attackingTile?: ITileState;

    /** Our health bar */
    public readonly healthBar: GameBar;

    // You can add additional member variables here
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Unit with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Unit.
     * @param viseur - The Viseur instance that controls everything and contains the game.
     */
    constructor(state: IUnitState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>

        this.ownerID = state.owner.id;
        this.container.scale.set(OVER_SCALE + 1, OVER_SCALE + 1);
        this.container.setParent(this.game.layers.game);


        if (state.job.title === "miner"){
            if ((state.job.health.indexOf(state.maxHealth) === 0) && (state.job.health.indexOf(state.maxCargoCapacity) === 0) && (state.job.health.indexOf(state.maxMiningPower) === 0) && (state.job.health.indexOf(state.maxMoves) === 0)){
                this.miner = ((state.owner.id === this.game.players[0].id)? this.addSprite.defaultMinerP1(): this.addSprite.defaultMinerP2());
            }
            else if (state.job.health.indexOf(state.maxHealth) === 1){
                this.miner = ((state.owner.id === this.game.players[0].id)? this.addSprite.minerHealthUp1P1(): this.addSprite.minerHealthUp1P2());
            }
            else if (state.job.health.indexOf(state.maxHealth) === 2){
                this.miner = ((state.owner.id === this.game.players[0].id)? this.addSprite.minerHealthUp2P1(): this.addSprite.minerHealthUp2P2());
            }
            else if (state.job.health.indexOf(state.maxHealth) === 3){
                this.miner = ((state.owner.id === this.game.players[0].id)? this.addSprite.minerHealthUp3P1(): this.addSprite.minerHealthUp3P2());
            }

            else if (state.job.health.indexOf(state.maxCargoCapacity) === 1){
                this.miner = ((state.owner.id === this.game.players[0].id)? this.addSprite.minerCargoUp1P1(): this.addSprite.minerCargoUp1P2());
            }
            else if (state.job.health.indexOf(state.maxCargoCapacity) === 2){
                this.miner = ((state.owner.id === this.game.players[0].id)? this.addSprite.minerCargoUp2P1(): this.addSprite.minerCargoUp2P2());
            }
            else if (state.job.health.indexOf(state.maxCargoCapacity) === 3){
                this.miner = ((state.owner.id === this.game.players[0].id)? this.addSprite.minerCargoUp3P1(): this.addSprite.minerCargoUp3P2());
            }

            else if (state.job.health.indexOf(state.maxMiningPower) === 1){
                this.miner = ((state.owner.id === this.game.players[0].id)? this.addSprite.minerPowerUp1P1(): this.addSprite.minerPowerUp1P2());
            }
            else if (state.job.health.indexOf(state.maxMiningPower) === 2){
                this.miner = ((state.owner.id === this.game.players[0].id)? this.addSprite.minerPowerUp2P1(): this.addSprite.minerPowerUp2P2());
            }
            else if (state.job.health.indexOf(state.maxMiningPower) === 3){
                this.miner = ((state.owner.id === this.game.players[0].id)? this.addSprite.minerPowerUp3P1(): this.addSprite.minerPowerUp3P2());
            }

            else if (state.job.health.indexOf(state.maxMoves) === 1){
                this.miner = ((state.owner.id === this.game.players[0].id)? this.addSprite.minerMoveUp1P1(): this.addSprite.minerMoveUp1P2());
            }
            else if (state.job.health.indexOf(state.maxMoves) === 2){
                this.miner = ((state.owner.id === this.game.players[0].id)? this.addSprite.minerMoveUp2P1(): this.addSprite.minerMoveUp2P2());
            }
            else if (state.job.health.indexOf(state.maxMoves) === 3){
                this.miner = ((state.owner.id === this.game.players[0].id)? this.addSprite.minerMoveUp3P1(): this.addSprite.minerMoveUp3P2());
            }
        }

        else if (state.job.title === "bomb"){
            this.bomb = this.addSprite.bomb();
        }
        //Flip
        if (state.owner.id === this.game.players[1].id) {
            this.container.scale.x *= -1;
        }

        // You can initialize your new Unit here.
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Unit instances.
     * Leave empty if it is not being rendered.
     *
     * @param dt - A floating point number [0, 1) which represents how far into
     * the next turn that current turn we are rendering is at
     * @param current - The current (most) game state, will be this.next if this.current is undefined.
     * @param next - The next (most) game state, will be this.current if this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta  - The the next (most) delta, which explains what happend.
     */
    public render(
        dt: number,
        current: Immutable<IUnitState>,
        next: Immutable<IUnitState>,
        delta: Immutable<CoreminerDelta>,
        nextDelta: Immutable<CoreminerDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);
        if (!next.tile) {
            this.container.visible = false;

            return;
        }
        this.container.visible = true;
        this.container.position.set(
            ease(current.tile.x, next.tile.x, dt) + Number(this.ownerID === this.game.players[0].id),
            ease(current.tile.y, next.tile.y, dt),
          );

        this.healthBar.update(ease(current.health, next.health, dt));
        pixiFade(this.container, dt, current.health, next.health);

        if (this.attackingTile) {
            const d = updown(dt);
            const dx = (this.attackingTile.x - current.tile.x) / 2;
            const dy = (this.attackingTile.y - current.tile.y) / 2;

            this.container.x += dx * d;
            this.container.y += dy * d;
        }
        // <<-- Creer-Merge: render -->>
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
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Unit instance should not be rendered,
     * such as going back in time before it existed.
     *
     * By default the super hides container.
     * If this sub class adds extra PIXI objects outside this.container, you should hide those too in here.
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
     * @param current - The current (most) game state, will be this.next if this.current is undefined.
     * @param next - The next (most) game state, will be this.current if this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta  - The the next (most) delta, which explains what happend.
     */
    public stateUpdated(
        current: Immutable<IUnitState>,
        next: Immutable<IUnitState>,
        delta: Immutable<CoreminerDelta>,
        nextDelta: Immutable<CoreminerDelta>,
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
    // NOTE: These functions are only used 99% of the time if the game supports human playable clients (like Chess).
    //       If it does not, feel free to ignore these Joueur functions.

    /**
     * Builds a support, shield, or ladder on Unit's tile, or an adjacent Tile.
     * @param tile The Tile to build on.
     * @param type The structure to build (support, ladder, or shield).
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully built,
     * False otherwise.
     */
    public build(
        tile: ITileState,
        type: "support" | "ladder" | "shield",
        callback?: (returned: boolean) => void,
    ): void {
        this.runOnServer("build", {tile, type}, callback);
    }

    /**
     * Dumps materials from cargo to an adjacent tile.
     * @param tile The tile the materials will be dumped on.
     * @param material The material the Unit will drop. 'dirt', 'ore', or
     * 'bomb'.
     * @param amount The number of materials to drop. Amounts <= 0 will drop all
     * the materials.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully dumped
     * materials, false otherwise.
     */
    public dump(
        tile: ITileState,
        material: "dirt" | "ore" | "bomb",
        amount: number,
        callback?: (returned: boolean) => void,
    ): void {
        this.runOnServer("dump", {tile, material, amount}, callback);
    }

    /**
     * Mines the Tile the Unit is on or an adjacent tile.
     * @param tile The Tile the materials will be mined from.
     * @param amount The amount of material to mine up. Amounts <= 0 will mine
     * all the materials that the Unit can.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully mined,
     * false otherwise.
     */
    public mine(
        tile: ITileState,
        amount: number,
        callback?: (returned: boolean) => void,
    ): void {
        this.runOnServer("mine", {tile, amount}, callback);
    }

    /**
     * Moves this Unit from its current Tile to an adjacent Tile.
     * @param tile The Tile this Unit should move to.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if it moved, false
     * otherwise.
     */
    public move(
        tile: ITileState,
        callback?: (returned: boolean) => void,
    ): void {
        this.runOnServer("move", {tile}, callback);
    }

    /**
     * Upgrade an attribute of this Unit. "health", "miningPower", "moves", or
     * "capacity".
     * @param attribute The attribute of the Unit to be upgraded.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully upgraded,
     * False otherwise.
     */
    public upgrade(
        attribute: "health" | "miningPower" | "moves" | "capacity",
        callback?: (returned: boolean) => void,
    ): void {
        this.runOnServer("upgrade", {attribute}, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
