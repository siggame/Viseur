// This is a class to represent the YoungGun object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { CowboyState, SaloonDelta, YoungGunState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import { ease } from "src/utils";
import { Player } from "./player";
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class YoungGun extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the YoungGun (dt = 0). */
    public current: YoungGunState | undefined;

    /** The next state of the YoungGun (dt = 1). */
    public next: YoungGunState | undefined;

    // <<-- Creer-Merge: variables -->>

    /** The player that control's this young gun. */
    private readonly owner: Player;

    /** The top part of the sprite (that is NOT colored). */
    private readonly spriteBottom = this.addSprite.youngGunBottom();

    /** The top part of the sprite (that is colored). */
    private readonly spriteTop = this.addSprite.youngGunTop();

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the YoungGun with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this YoungGun.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: YoungGunState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>

        this.owner = this.game.gameObjects[state.owner.id] as Player;

        if (state.owner.id === "0") {
            // then they are first player, so flip them
            this.spriteBottom.scale.x *= -1;
            this.spriteBottom.anchor.x += 1;
            this.spriteTop.scale.x *= -1;
            this.spriteTop.anchor.x += 1;
        }

        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render YoungGun
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
        current: Immutable<YoungGunState>,
        next: Immutable<YoungGunState>,
        delta: Immutable<SaloonDelta>,
        nextDelta: Immutable<SaloonDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        this.container.position.set(
            ease(current.tile.x, next.tile.x, dt, "cubicInOut"),
            ease(current.tile.y, next.tile.y, dt, "cubicInOut"),
        );
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this YoungGun's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        this.spriteTop.tint = this.game
            .getPlayersColor(this.owner)
            .rgbNumber();
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this YoungGun instance should not be rendered,
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
        current: Immutable<YoungGunState>,
        next: Immutable<YoungGunState>,
        delta: Immutable<SaloonDelta>,
        nextDelta: Immutable<SaloonDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        if (current.tile.tileSouth) {
            this.container.setParent(this.game.layers.game);
        } else {
            this.container.setParent(this.game.layers.balcony);
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
     * Tells the YoungGun to call in a new Cowboy of the given job to the open
     * Tile nearest to them.
     *
     * @param job - The job you want the Cowboy being brought to have.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is The new Cowboy that was called
     * in if valid. They will not be added to any `cowboys` lists until the turn
     * ends. Null otherwise.
     */
    public callIn(
        job: "Bartender" | "Brawler" | "Sharpshooter",
        callback: (returned: CowboyState) => void,
    ): void {
        this.runOnServer("callIn", { job }, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
