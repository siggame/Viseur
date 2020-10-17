// This is a class to represent the Port object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { PiratesDelta, PortState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import * as Color from "color";
// any additional imports you want can be added here safely between Creer runs
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Port extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Port (dt = 0). */
    public current: PortState | undefined;

    /** The next state of the Port (dt = 1). */
    public next: PortState | undefined;

    // <<-- Creer-Merge: variables -->>

    /** The id of our owner, if we have one. */
    public ownerID?: string;

    /** The sprite. */
    public sprite: PIXI.Sprite;
    /** Sprite for rotation animation. */
    public rotatedSprite: PIXI.Sprite;
    /** The color of our port. */
    public portColor: PIXI.Sprite;
    /** The roated port color animation. */
    public rotatedPortColor: PIXI.Sprite;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Port with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Port.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: PortState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        this.ownerID = state.owner && state.owner.id;

        this.container.setParent(this.game.layers.port);

        const hide = { visible: true };
        this.sprite = this.addSprite.port(hide);
        this.rotatedSprite = this.addSprite.rotatedPort(hide);

        const portOptions = {
            ...hide,
            alpha: 0.75,
            blendMode: 2,
        };
        this.portColor = this.addSprite.portColor(portOptions);
        this.rotatedPortColor = this.addSprite.rotatedPortColor(portOptions);

        this.container.position.set(state.tile.x, state.tile.y);
        // You can initialize your new Port here.
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Port
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
        current: Immutable<PortState>,
        next: Immutable<PortState>,
        delta: Immutable<PiratesDelta>,
        nextDelta: Immutable<PiratesDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        this.sprite.visible = true;
        this.rotatedSprite.visible = false;
        this.portColor.visible = true;
        this.rotatedPortColor.visible = false;
        if (
            this.current &&
            this.current.tile &&
            this.current.tile.tileEast &&
            this.current.tile.tileWest
        ) {
            if (
                this.current.tile.tileEast.type === "water" &&
                this.current.tile.tileWest.type === "water"
            ) {
                this.rotatedSprite.visible = true;
                this.rotatedPortColor.visible = true;
                this.portColor.visible = false;
                this.sprite.visible = false;
            }
        }
        this.container.visible = Boolean(next.tile);

        // render where the Port is
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Port's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        if (this.ownerID === undefined) {
            const white = Color("white");
            this.portColor.tint = white.rgbNumber();
            this.rotatedPortColor.tint = white.rgbNumber();

            return;
        }
        const ownerColor = this.game.getPlayersColor(this.ownerID);
        this.portColor.tint = ownerColor.rgbNumber();
        this.rotatedPortColor.tint = ownerColor.rgbNumber();
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Port instance should not be rendered,
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
        current: Immutable<PortState>,
        next: Immutable<PortState>,
        delta: Immutable<PiratesDelta>,
        nextDelta: Immutable<PiratesDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Port based off its states
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
     * Spawn a Unit on this port.
     *
     * @param type - What type of Unit to create ('crew' or 'ship').
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if Unit was created
     * successfully, false otherwise.
     */
    public spawn(
        type: "crew" | "ship",
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("spawn", { type }, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
