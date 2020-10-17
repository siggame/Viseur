// This is a class to represent the Machine object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { MachineState, NewtonianDelta } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import * as PIXI from "pixi.js";
import { ease } from "src/utils";
import { GameBar } from "src/viseur/game";
const CONTAINER_SCALE = 1.25;
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
// Set this variable to `true`, if this class should render.
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Machine extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Machine (dt = 0). */
    public current: MachineState | undefined;

    /** The next state of the Machine (dt = 1). */
    public next: MachineState | undefined;

    // <<-- Creer-Merge: variables -->>
    /** Bar showing how much work is done. */
    private readonly workBar: GameBar;

    /** The owner's ore index in the players array. */
    private readonly oreColorIndex: 0 | 1;

    /** The sprite colored for this machine. */
    private readonly sprite: PIXI.Sprite;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Machine with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Machine.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: MachineState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        this.container.setParent(this.game.layers.machine);
        this.container.scale.set(CONTAINER_SCALE, CONTAINER_SCALE);
        const offset = (CONTAINER_SCALE - 1) / 2;
        this.container.position.set(
            state.tile.x - offset,
            state.tile.y - offset - 0.2,
        );

        this.oreColorIndex =
            state.oreType.toLowerCase().charAt(0) === "r"
                ? 0 // redium ore
                : 1; // blueium ore

        this.sprite = this.addSprite.machine();

        const barContainer = new PIXI.Container();
        barContainer.setParent(this.container);
        barContainer.position.y += 0.1;

        this.workBar = new GameBar(barContainer, {
            foregroundColor: "green",
            max: state.refineTime,
        });
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Machine
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
        current: Immutable<MachineState>,
        next: Immutable<MachineState>,
        delta: Immutable<NewtonianDelta>,
        nextDelta: Immutable<NewtonianDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        this.workBar.update(ease(current.worked, next.worked, dt));
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Machine's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // use the color of the player from that side so it can be changed for color blindness.
        this.sprite.tint = this.game
            .getPlayersColor(this.oreColorIndex)
            .rgbNumber();
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Machine instance should not be rendered,
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
        current: Immutable<MachineState>,
        next: Immutable<MachineState>,
        delta: Immutable<NewtonianDelta>,
        nextDelta: Immutable<NewtonianDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Machine based off its states
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
