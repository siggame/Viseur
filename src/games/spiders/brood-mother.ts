// This is a class to represent the BroodMother object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { Spider } from "./spider";
import {
    BroodMotherState,
    SpiderlingState,
    SpidersDelta,
} from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import { setRelativePivot } from "src/utils";
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
// Set this variable to `true`, if this class should render.
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class BroodMother extends makeRenderable(Spider, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the BroodMother (dt = 0). */
    public current: BroodMotherState | undefined;

    /** The next state of the BroodMother (dt = 1). */
    public next: BroodMotherState | undefined;

    // <<-- Creer-Merge: variables -->>

    /** The owner's ID. */
    private readonly ownerID: string;

    /** The top part of the sprite to re-color. */
    private readonly spriteTop: PIXI.Sprite;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the BroodMother with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this BroodMother.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: BroodMotherState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>

        this.ownerID = state.owner.id;

        const scaled = { relativeScale: 7.5 };
        this.addSprite.broodmotherBottom(scaled);
        this.spriteTop = this.addSprite.broodmotherTop(scaled);

        setRelativePivot(this.container);
        this.container.position.set(state.nest.x, state.nest.y);

        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render BroodMother
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
        current: Immutable<BroodMotherState>,
        next: Immutable<BroodMotherState>,
        delta: Immutable<SpidersDelta>,
        nextDelta: Immutable<SpidersDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this BroodMother's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>

        const color = this.game.getPlayersColor(this.ownerID);

        this.spriteTop.tint = color.rgbNumber();

        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this BroodMother instance should not be rendered,
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
        current: Immutable<BroodMotherState>,
        next: Immutable<BroodMotherState>,
        delta: Immutable<SpidersDelta>,
        nextDelta: Immutable<SpidersDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the BroodMother based off its states
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
     * Consumes a Spiderling of the same owner to regain some eggs to spawn more
     * Spiderlings.
     *
     * @param spiderling - The Spiderling to consume. It must be on the same
     * Nest as this BroodMother.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if the Spiderling was
     * consumed. False otherwise.
     */
    public consume(
        spiderling: SpiderlingState,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("consume", { spiderling }, callback);
    }

    /**
     * Spawns a new Spiderling on the same Nest as this BroodMother, consuming
     * an egg.
     *
     * @param spiderlingType - The string name of the Spiderling class you want
     * to Spawn. Must be 'Spitter', 'Weaver', or 'Cutter'.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is The newly spawned Spiderling if
     * successful. Null otherwise.
     */
    public spawn(
        spiderlingType: "Spitter" | "Weaver" | "Cutter",
        callback: (returned: SpiderlingState) => void,
    ): void {
        this.runOnServer("spawn", { spiderlingType }, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
