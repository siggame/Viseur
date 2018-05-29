// This is a class to represent the BroodMother object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { Viseur } from "src/viseur";
import { IDeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { Spider } from "./spider";
import { IBroodMotherState, ISpiderlingState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import { setRelativePivot } from "src/utils";
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class BroodMother extends Spider {
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
        return super.shouldRender; // change this to true to render all instances of this class
        // <<-- /Creer-Merge: should-render -->>
    }

    /** The instance of the game this game object is a part of */
    public readonly game!: Game; // set in super constructor

    /** The current state of the BroodMother (dt = 0) */
    public current: IBroodMotherState | undefined;

    /** The next state of the BroodMother (dt = 1) */
    public next: IBroodMotherState | undefined;

    // <<-- Creer-Merge: variables -->>

    /** The owner's ID */
    private readonly ownerID: string;

    /** the top part of the sprite to re-color */
    private readonly spriteTop: PIXI.Sprite;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the BroodMother with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this BroodMother
     * @param Visuer the Viseur instance that controls everything and contains
     * the game.
     */
    constructor(state: IBroodMotherState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>

        this.ownerID = state.owner.id;

        const scaled = { relativeScale: 7.5 };
        this.game.resources.broodmotherBottom.newSprite(this.container, scaled);
        this.spriteTop = this.game.resources.broodmotherTop.newSprite(this.container, scaled);

        setRelativePivot(this.container);
        this.container.position.set(state.nest.x, state.nest.y);

        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render BroodMother
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
    public render(dt: number, current: IBroodMotherState, next: IBroodMotherState,
                  reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this BroodMother's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>

        const color = this.game.getPlayersColor(this.ownerID);

        this.spriteTop.tint = color.rgbNumber();

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
    public stateUpdated(current: IBroodMotherState, next: IBroodMotherState,
                        reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        // update the BroodMother based off its states
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
     * Consumes a Spiderling of the same owner to regain some eggs to spawn more
     * Spiderlings.
     * @param spiderling The Spiderling to consume. It must be on the same Nest
     * as this BroodMother.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if the Spiderling was
     * consumed. False otherwise.
     */
    public consume(spiderling: ISpiderlingState, callback?: (returned: boolean)
                   => void,
    ): void {
        this.runOnServer("consume", {spiderling}, callback);
    }

    /**
     * Spawns a new Spiderling on the same Nest as this BroodMother, consuming
     * an egg.
     * @param spiderlingType The string name of the Spiderling class you want to
     * Spawn. Must be 'Spitter', 'Weaver', or 'Cutter'.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is The newly spwaned Spiderling if
     * successful. Null otherwise.
     */
    public spawn(spiderlingType: string, callback?: (returned: ISpiderlingState)
                 => void,
    ): void {
        this.runOnServer("spawn", {spiderlingType}, callback);
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
