// This is a class to represent the YoungGun object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { Viseur } from "src/viseur";
import { IDeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { GameObject } from "./game-object";
import { ICowboyState, IYoungGunState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import { ease } from "src/utils";
import { Player } from "./player";
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class YoungGun extends GameObject {
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
        return true;
        // <<-- /Creer-Merge: should-render -->>
    }

    /** The instance of the game this game object is a part of */
    public readonly game!: Game; // set in super constructor

    /** The current state of the YoungGun (dt = 0) */
    public current: IYoungGunState | undefined;

    /** The next state of the YoungGun (dt = 1) */
    public next: IYoungGunState | undefined;

    // <<-- Creer-Merge: variables -->>

    /** The player that control's this young gun */
    private readonly owner: Player;

    /** The top part of the sprite (that is NOT colored) */
    private readonly spriteBottom = this.game.resources.youngGunBottom.newSprite(this.container);

    /** The top part of the sprite (that is colored) */
    private readonly spriteTop = this.game.resources.youngGunTop.newSprite(this.container);

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the YoungGun with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this YoungGun
     * @param Visuer the Viseur instance that controls everything and contains
     * the game.
     */
    constructor(state: IYoungGunState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>

        this.owner = this.game.gameObjects[state.owner.id] as Player;

        if (state.owner.id === "0") { // then they are first player, so flip them
            this.spriteBottom.scale.x *= -1;
            this.spriteBottom.anchor.x += 1;
            this.spriteTop.scale.x *= -1;
            this.spriteTop.anchor.x += 1;
        }

        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render YoungGun
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
    public render(dt: number, current: IYoungGunState, next: IYoungGunState,
                  reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>
        this.container.position.set(
            ease(current.tile.x, next.tile.x, dt, "cubicInOut"),
            ease(current.tile.y, next.tile.y, dt, "cubicInOut"),
        );
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this YoungGun's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        this.spriteTop.tint = this.game.getPlayersColor(this.owner).rgbNumber();
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
    public stateUpdated(current: IYoungGunState, next: IYoungGunState,
                        reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        if (current.tile.tileSouth) {
            this.container.setParent(this.game.layers.game);
        }
        else {
            this.container.setParent(this.game.layers.balcony);
        }
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
     * Tells the YoungGun to call in a new Cowboy of the given job to the open
     * Tile nearest to them.
     * @param job The job you want the Cowboy being brought to have.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is The new Cowboy that was called
     * in if valid. They will not be added to any `cowboys` lists until the turn
     * ends. Null otherwise.
     */
    public callIn(job: string, callback?: (returned: ICowboyState) => void): void {
        this.runOnServer("callIn", {job}, callback);
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
