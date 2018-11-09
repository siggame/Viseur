// This is a class to represent the Machine object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { Viseur } from "src/viseur";
import { IDeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { GameObject } from "./game-object";
import { IMachineState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
import * as Color from "color";
import { ease } from "src/utils";
import { GameBar } from "src/viseur/game";
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class Machine extends GameObject {
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

    /** The current state of the Machine (dt = 0) */
    public current: IMachineState | undefined;

    /** The next state of the Machine (dt = 1) */
    public next: IMachineState | undefined;

    // <<-- Creer-Merge: variables -->>
    public barContainer: PIXI.Container;
    // You can add additional member variables here

    public machineSprite: PIXI.Sprite;
    public type: string;
    public maxWork: number;
    private readonly workBar: GameBar;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Machine with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this Machine
     * @param Visuer the Viseur instance that controls everything and contains
     * the game.
     */
    constructor(state: IMachineState, viseur: Viseur) {
        super(state, viseur);
        // <<-- Creer-Merge: constructor -->>
        // You can initialize your new Machine here.
        this.container.setParent(this.game.layers.machine);
        this.machineSprite = this.game.resources.machine.newSprite(this.container);
        this.type = state.oreType.toLowerCase().charAt(0);
        if (state.tile) {
            this.container.position.set(state.tile.x, state.tile.y);
        }
        else {
            this.container.position.set(-1, -1);
        }
        this.container.scale.x = 1.35;
        this.container.scale.y = 1.35;
        this.container.position.y -= .5;
        this.container.position.x -= .15;

        this.barContainer = new PIXI.Container();
        this.barContainer.setParent(this.container);
        this.barContainer.position.y += 0.1;

        this.workBar = new GameBar(this.barContainer);
        this.workBar.recolor("green");
        this.maxWork = state.refineTime;
        this.recolor();
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Machine
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
    public render(dt: number, current: IMachineState, next: IMachineState,
                  reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>
        // render where the Machine is
        const currWork = current.worked / this.maxWork;
        const nextWork = next.worked / this.maxWork;
        // this.container.position.set(next.tile.x, next.tile.y);
        this.workBar.update(ease(currWork, nextWork, dt));
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this Machine's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        const color = this.type === "r" ? Color("red") : Color("blue");

        this.machineSprite.tint = color.rgbNumber();
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
    public stateUpdated(current: IMachineState, next: IMachineState,
                        reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        // update the Machine based off its states
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // NOTE: past this block are functions only used 99% of the time if
    //       the game supports human playable clients (like Chess).
    //       If it does not, feel free to ignore everything past here.

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
