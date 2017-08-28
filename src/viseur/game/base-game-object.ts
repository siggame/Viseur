import * as Color from "color";
import * as PIXI from "pixi.js";
import { MenuItems } from "src/core/ui/context-menu";
import { ease } from "src/utils/";
import { viseur } from "src/viseur";
import { Renderer } from "../renderer";
import { BaseGame } from "./base-game";
import { IDeltaReason } from "./gamelog";
import { IState, StateObject } from "./state-object";

/** A reference to a game object, which just holds the ID of the game object */
export interface IGameObjectReference extends IState {
    /**
     * A unique id for each instance of a GameObject or a sub class.
     * Used for client and server communication.
     * Should never change value after being set.
     */
    id: string;
}

/** A state of a game object at a discrete point in time */
export interface IBaseGameObjectState extends IGameObjectReference {
    /**
     * String representing the top level Class that this game object is an instance of.
     * Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
     */
    gameObjectName: string;

    /**
     * Any strings logged will be stored here. Intended for debugging.
     */
    logs: string[];
}

/** the base class all GameObjects inherit from */
export class BaseGameObject extends StateObject {
     /** The ID of this game object. It will never change. */
    public readonly id: string;

    /** The class name as a string of the top level class this game object is, used primarily for reflection */
    public readonly gameObjectName: string;

    /** The instance of the game this game object is a part of */
    public readonly game: BaseGame;

    /** The main container that all sprites to display this object should be put in */
    public readonly container: PIXI.Container;

    /** The renderer that provides utility rendering functions (as well as heavy lifting for screen changes) */
    public readonly renderer: Renderer;

    /** The current state (e.g. at delta time = 0) */
    public current: IBaseGameObjectState;

    /** The next state (e.g. at delta time = 1) */
    public next: IBaseGameObjectState;

    /** pixi text to display the last logged string */
    private loggedPixiText: PIXI.Text;

    /**
     * Initializes a BaseGameObject, should be invoked by subclass
     * @param {Object} initialState - fully merged delta state for this object's first existence
     * @param {BaseGame} game - The game this game object is being rendered in
     */
    constructor(initialState: IBaseGameObjectState, game: BaseGame) {
        super();

        this.id = initialState.id;
        this.gameObjectName = initialState.gameObjectName;

        this.game = game;
        this.renderer = game.renderer;

        if (this.shouldRender()) {
            // initialize the container that will be rendered!
            this.container = new PIXI.Container();

            // else make the container work for clicking
            this.container.interactive = true;

            const onClick = (e: PIXI.interaction.InteractionEvent) => {
                this.clicked(e);
            };
            /** spell-checker:disable */
            this.container.on("mouseupoutside", onClick);
            this.container.on("mouseup", onClick);
            this.container.on("touchend", onClick);
            this.container.on("touchendoutside", onClick);

            const onRightClick = (e: PIXI.interaction.InteractionEvent) => {
                this.rightClicked(e);
            };
            this.container.on("rightup", onRightClick);
            this.container.on("rightupoutside", onRightClick);
            /** spell-checker:enable */
        }
    }

    /**
     * Override this return true to actually render instances of super classes
     * @returns true if Viseur should render game object classes of this instance,
     *          false otherwise which optimizes playback speed
     */
    public shouldRender(): boolean {
        return false;
    }

    /**
     * Runs some command on the server, on behalf of this object
     * @param {string} run - the function to run
     * @param {Object} args - key value pairs for the function to run
     * @param {Function} callback - callback to invoke once run, is passed the return value
     */
    public runOnServer(run: string, args: object, callback: (returned: any) => void): void {
        viseur.runOnServer(this.id, run, args, callback);
    }

    /**
     * should be invoked after the game object's current and next state, prior to rendering
     * @override
     * @param {Object} current - the current state
     * @param {Object} next - the next state
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    public update(
        current?: IBaseGameObjectState,
        next?: IBaseGameObjectState,
        reason?: IDeltaReason,
        nextReason?: IDeltaReason,
    ): void {
        super.update(current, next, reason, nextReason);
    }

    /**
     * Renders the GameObject, this is the main method that developers will
     * override in the inheriting class to render them via game logic
     * @param {Number} dt a floating point number [0, 1) which represents how
     *                    far into the next turn that current turn we are rendering is at
     * @param {GameObjectState} current the current (most) game state, will be this.next if this.current is null
     * @param {GameObjectState} next the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason the reason for the current delta
     * @param {DeltaReason} nextReason the reason for the next delta
     */
    public render(
        dt: number,
        current: IBaseGameObjectState,
        next: IBaseGameObjectState,
        reason: IDeltaReason,
        nextReason: IDeltaReason,
    ): void {
        this.renderLogs(dt, current, next);
    }

    /**
     * Intended to be overridden by classes that have a player color so they
     * can re-color themselves when a player color changes
     * Also automatically invoked after initialization
     */
    public recolor(): void {
        // do nothing, if a game object can be recolored, it should override this function
    }

    /**
     * Invoked when the state updates. Intended to be overridden by subclass(es)
     * @param {Object} current the current (most) game state, will be this.next if this.current is null
     * @param {Object} next the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason the reason for the current delta
     * @param {DeltaReason} nextReason the reason for the next delta
     */
    public stateUpdated(
        current: IBaseGameObjectState,
        next: IBaseGameObjectState,
        reason: IDeltaReason,
        nextReason: IDeltaReason,
    ): void {
        // intended to be overridden by inheriting classes, no need to call this super
    }

    /**
     * gets the unique context menu items, intended to be overridden by sub classes
     * @returns Any array of items valid for a ContextMenu
     */
    protected getContextMenu(): MenuItems {
        return [];
    }

    /**
     * Invoked when this game object's container is clicked
     * @param event the click event
     */
    private clicked(event: PIXI.interaction.InteractionEvent): void {
        const menu = this.getContextMenu();
        if (menu.length > 0) {
            const item = menu[0];
            if (typeof(item) === "object") {
                item.callback();
            }
        }
    }

    /**
     * Invoked when this game object's container is right clicked, to pull up its context menu
     * @param event the pixi event from the right click
     */
    private rightClicked(event: PIXI.interaction.InteractionEvent): void {
        const scale = viseur.settings.resolutionScale.get();
        this.showContextMenu(event.data.global.x / scale, event.data.global.y / scale);
    }

    // Context Menus \\

    /**
     * Displays a context menu (right click menu) over this game object
     * @param {number} x the x coordinate where it should be shown (in pixels)
     * @param {number} y the y coordinate where it should be shown (in pixels)
     */
    private showContextMenu(x: number, y: number): void {
        this.renderer.showContextMenu(this.getFullContextMenu(), x, y);
    }

    /**
     * Gets the full context menu (getContextMenu + getBottomContextMenu) and removes unneeded separators
     * @returns Any array of items valid for a ContextMenu
     */
    private getFullContextMenu(): MenuItems {
        const menu = this.getContextMenu().concat(this.getBottomContextMenu());

        // pop items off the front that are just separators
        while (menu[0] === "---") {
            menu.shift();
        }

        // pop items off the back that are just separators
        while (menu[menu.length - 1] === "---") {
            menu.pop();
        }

        return menu;
    }

    /**
     * Gets the bottom part of the context menu to be automatically appended to
     * the regular _getContextMenu part, should be a separator + Inspect
     * @returns Any array of items valid for a ContextMenu
     */
    private getBottomContextMenu(): MenuItems {
        return [
            "---",
            {
                icon: "code",
                text: "Inspect",
                description: "Reveals this GameObject in the Inspector so you can examine variable values.",
                callback: () => {
                    this.emit("inspect");
                },
            },
        ];
    }

    private renderLogs(dt: number, current: IBaseGameObjectState, next: IBaseGameObjectState): void {
        if (this.container) {
            if (next.logs.length > 0 && viseur.settings.showLoggedText.get()) {
                let alpha = 1;
                if (current.logs.length < next.logs.length) {
                    alpha = ease(dt, "cubicInOut"); // fade it in
                }
                // then they logged a string, so show it above their head
                const str = next.logs[next.logs.length - 1];

                if (!this.loggedPixiText) {
                    this.loggedPixiText = this.renderer.newPixiText(str, this.container, {
                        fill: Color("white").hex(),
                    }, 0.25);
                    this.loggedPixiText.anchor.set(0.5);
                    this.loggedPixiText.x = 0.5;
                }

                this.loggedPixiText.visible = true;
                this.loggedPixiText.alpha = alpha;
                this.loggedPixiText.text = str;
            }
            else if (this.loggedPixiText) {
                this.loggedPixiText.visible = false;
            }
        }
    }
}
