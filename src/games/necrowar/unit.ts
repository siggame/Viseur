// This is a class to represent the Unit object in the game.
// If you want to render it in the game do so here.
import { Delta } from "@cadre/ts-utils/cadre";
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { ITileState, IUnitState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import { ease } from "src/utils";
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
// Set this variable to `true`, if this class should render.
const SHOULD_RENDER = true;
const OVER_SCALE = 0.1;
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

    /** abomination */
    public readonly abomination: PIXI.Sprite | undefined;
    /** dog */
    public readonly dog: PIXI.Sprite | undefined;
    /** ghoul */
    public readonly ghoul: PIXI.Sprite | undefined;
    /** horde */
    public readonly horde: PIXI.Sprite | undefined;
    /** horseman */
    public readonly horseman: PIXI.Sprite | undefined;
    /** necromancer */
    public readonly necromancer: PIXI.Sprite | undefined;
    /** skeleton */
    public readonly skeleton: PIXI.Sprite | undefined;
    /** worker */
    public readonly worker: PIXI.Sprite | undefined;
    /** wraith */
    public readonly wraith: PIXI.Sprite | undefined;
    /** zombie */
    public readonly zombie: PIXI.Sprite | undefined;

    // <<-- Creer-Merge: variables -->>
    /** The id of the owner of this unit, for recoloring */
    public ownerID: string;

    // /** The tile state of the tile we are attacking, if we are. */
    // public attackingTile?: ITileState;

    // /** Our health bar */
    // public readonly healthBar: GameBar;
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
        this.container.position.x -= OVER_SCALE / 2;
        this.container.setParent(this.game.layers.game);

        if (state.job.title === "abomination") {
            this.abomination = this.addSprite.abomination();
        }
        else if (state.job.title === "hound") {
            this.dog = this.addSprite.dog();
        }
        else if (state.job.title === "ghoul") {
            this.ghoul = this.addSprite.ghould();
        }
        else if (state.job.title === "zombie") {
            this.zombie = this.addSprite.zombie();
        }
        else if (state.job.title === "wraith") {
            this.abomination = this.addSprite.wraith();
        }
        else if (state.job.title === "horseman") {
            this.horseman = this.addSprite.horseman();
        }
        else if (state.job.title === "worker") {
            this.worker = this.addSprite.necromancer();
        }

        if (state.owner.id === this.game.players[0].id) {
            this.container.scale.x *= -1;
            this.container.position.x += 1;
        }
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
        if (!next.tile) {
            this.container.visible = false;

            return;
        }
        this.container.visible = true;
        this.container.position.set(
            ease(current.tile.x, next.tile.x, dt),
            ease(current.tile.y, next.tile.y, dt),
        );
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
     * Attacks an enemy tower on an adjacent tile.
     * @param tile The Tile to attack.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully attacked,
     * false otherwise.
     */
    public attack(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("attack", {tile}, callback);
    }

    /**
     * Unit, if it is a worker, builds a tower on the tile it is on, only
     * workers can do this.
     * @param title The tower type to build, as a string.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully built,
     * false otherwise.
     */
    public build(title: string, callback?: (returned: boolean) => void): void {
        this.runOnServer("build", {title}, callback);
    }

    /**
     * Stops adjacent to a river tile and begins fishing for mana.
     * @param tile The tile the unit will stand on as it fishes.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully began
     * fishing for mana, false otherwise.
     */
    public fish(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("fish", {tile}, callback);
    }

    /**
     * Enters a mine and is put to work gathering resources.
     * @param tile The tile the mine is located on.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully entered
     * mine and began mining, false otherwise.
     */
    public mine(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("mine", {tile}, callback);
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

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
