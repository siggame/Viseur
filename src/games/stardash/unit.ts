// This is a class to represent the Unit object in the game.
// If you want to render it in the game do so here.
import { Delta } from "@cadre/ts-utils/cadre";
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { IBodyState, IProjectileState, IUnitState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
import { ease, pixiFade } from "src/utils"; // , isObject, pixiFade, updown } from "src/utils";
import { GameBar } from "src/viseur/game";
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
    // You can add additional member variables here
    public ownerID: string;
    public jobSprite: PIXI.Sprite;
    public healthBar: GameBar;
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
        // You can initialize your new Unit here.
        this.ownerID = state.owner.id;
        this.container.scale.set(1, 1);
        const jobContainer = new PIXI.Container();
        jobContainer.setParent(this.container);

        if (state.job.id === "2") {
            this.jobSprite = this.addSprite.corvette();
        }
        else if (state.job.id === "3") {
            this.jobSprite = this.addSprite.missleboat();
        }
        else if (state.job.id === "4") {
            this.jobSprite = this.addSprite.martyr();
        }
        else if (state.job.id === "5") {
            this.jobSprite = this.addSprite.transport();
        }
        else {
            this.jobSprite = this.addSprite.miner();
        }
        if (state.job.id === "5") {
            this.jobSprite.scale.set(1 * .1, 1 * .1);
        }
        else {
            this.jobSprite.scale.set(1 * .01, 1 * .01);
        }

        const barContainer = new PIXI.Container();
        barContainer.setParent(this.container);
        barContainer.position.y -= 30;
        this.healthBar = new GameBar(barContainer, {
            max: state.job.energy,
            visibilitySetting: this.game.settings.displayHealthBars,
            backgroundColor: "grey",
            height: 10,
            width: 50,
        });
<<<<<<< HEAD

=======
>>>>>>> cfc070ebc9676d0f65aa80e0162b374b7c163d77
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
        delta: Immutable<Delta>,
        nextDelta: Immutable<Delta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        // const shield = PIXI.Sprite.fromImage("resources/shield.png");
        // shield.scale.set(1 * .1, 1 * .1);
        // render where the Unit is
        if (next.energy <= 0) {
            this.container.visible = false;

            return;
        }
        this.container.visible = true;
        this.container.position.set(
            ease(current.x, next.x, dt),
            ease(current.y, next.y, dt),
        );
        if (next.shield > 0 || next.protector !== null) {
            this.jobSprite.mask = this.addSprite.shield();
            this.jobSprite.mask.x -= 11;
            this.jobSprite.mask.y -= 14;
            this.jobSprite.mask.scale.set(1 * .12, 1 * .12);
            this.jobSprite.mask.alpha = 0.05;
        }
        else {
            this.jobSprite.mask = null;
        }

        this.healthBar.update(ease(current.energy, next.energy, dt));
        pixiFade(this.container, dt, current.energy, next.energy);
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
        const color = this.game.getPlayersColor(this.ownerID).rgbNumber();
        this.jobSprite.tint = color;
        this.healthBar.recolor(color);
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
        delta: Immutable<Delta>,
        nextDelta: Immutable<Delta>,
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
     * Attacks the specified unit.
     * @param enemy The Unit being attacked.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully attacked,
     * false otherwise.
     */
    public attack(enemy: IUnitState, callback?: (returned: boolean) => void): void {
        this.runOnServer("attack", {enemy}, callback);
    }

    /**
     * Causes the unit to dash towards the designated destination.
     * @param x The x value of the destination's coordinates.
     * @param y The y value of the destination's coordinates.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if it moved, false
     * otherwise.
     */
    public dash(x: number, y: number, callback?: (returned: boolean) => void): void {
        this.runOnServer("dash", {x, y}, callback);
    }

    /**
     * allows a miner to mine a asteroid
     * @param body The object to be mined.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully acted,
     * false otherwise.
     */
    public mine(body: IBodyState, callback?: (returned: boolean) => void): void {
        this.runOnServer("mine", {body}, callback);
    }

    /**
     * Moves this Unit from its current location to the new location specified.
     * @param x The x value of the destination's coordinates.
     * @param y The y value of the destination's coordinates.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if it moved, false
     * otherwise.
     */
    public move(x: number, y: number, callback?: (returned: boolean) => void): void {
        this.runOnServer("move", {x, y}, callback);
    }

    /**
     * tells you if your ship can move to that location from were it is without
     * clipping the sun.
     * @param x The x position of the location you wish to arrive.
     * @param y The y position of the location you wish to arrive.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if pathable by this unit,
     * false otherwise.
     */
    public safe(x: number, y: number, callback?: (returned: boolean) => void): void {
        this.runOnServer("safe", {x, y}, callback);
    }

    /**
     * Attacks the specified projectile.
     * @param missile The projectile being shot down.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully attacked,
     * false otherwise.
     */
    public shootdown(missile: IProjectileState, callback?: (returned: boolean)
                     => void,
    ): void {
        this.runOnServer("shootdown", {missile}, callback);
    }

    /**
     * Grab materials from a friendly unit. Doesn't use a action.
     * @param unit The unit you are grabbing the resources from.
     * @param amount The amount of materials to you with to grab. Amounts <= 0
     * will pick up all the materials that the unit can.
     * @param material The material the unit will pick up. 'genarium', 'rarium',
     * 'legendarium', or 'mythicite'.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully taken,
     * false otherwise.
     */
    public transfer(unit: IUnitState, amount: number, material: string,
                    callback?: (returned: boolean) => void,
    ): void {
        this.runOnServer("transfer", {unit, amount, material}, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
