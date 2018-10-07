import { IBaseGameObject } from "cadre-ts-utils/cadre";
import * as Color from "color";
import * as PIXI from "pixi.js";
import { MenuItems } from "src/core/ui/context-menu";
import { ease, Immutable } from "src/utils/";
import { Viseur } from "src/viseur";
import { Renderer } from "src/viseur/renderer";
import { BaseGame } from "./base-game";
import { DeltaReason } from "./gamelog";
import { StateObject } from "./state-object";

/** the base class all GameObjects inherit from */
export class BaseGameObject<TShouldRender extends boolean> extends StateObject {
     /** The ID of this game object. It will never change. */
    public readonly id: string;

    /**
     * The class name as a string of the top level class this game object is,
     * used primarily for reflection.
     */
    public readonly gameObjectName: string;

    /** The instance of the game this game object is a part of */
    public readonly game: BaseGame;

    /** Flag for if this game object should be rendered. Set to true to render it. */
    public readonly shouldRender!: TShouldRender;

    /** The main container that all sprites to display this object should be put in. */
    public readonly container!: TShouldRender extends true ? PIXI.Container : undefined;

    /**
     * The renderer that provides utility rendering functions (as well as
     * all the heavy lifting for screen changes).
     */
    public readonly renderer: Renderer;

    /** The current state (e.g. at delta time = 0) */
    public current: IBaseGameObject | undefined;

    /** The next state (e.g. at delta time = 1) */
    public next: IBaseGameObject | undefined;

    /** The Viseur instance that controls this game object */
    protected readonly viseur: Viseur;

    /** pixi text to display the last logged string */
    private loggedPixiText: PIXI.Text | undefined;

    /**
     * Initializes a BaseGameObject, should be invoked by subclass.
     *
     * @param initialState - Fully merged delta state for this object's first
     * existence.
     * @param viseur - The Viseur instance that controls this game object.
     */
    constructor(initialState: Immutable<IBaseGameObject>, viseur: Viseur) {
        super();

        this.id = initialState.id;
        this.gameObjectName = initialState.gameObjectName;

        this.viseur = viseur;
        this.game = viseur.game as BaseGame;
        this.renderer = this.game.renderer;

        if (this.shouldRender) {
            // initialize the container that will be rendered!
            this.container = new PIXI.Container();
            // add containers to the game layer by default
            // sub classes can move it if they please
            this.container.setParent(this.game.layers.game);

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
     * Runs some command on the server, on behalf of this object.
     *
     * @param run - The function to run.
     * @param args - Key/value pairs for the function to run.
     * @param callback - An optional callback to invoke once run, is passed
     * the return value.
     */
    public runOnServer(
        run: string,
        args: Immutable<object>,
        callback?: (returned: unknown) => void,
    ): void {
        this.viseur.runOnServer(this.id, run, args, callback);
    }

    /**
     * Should be invoked after the game object's current and next state, prior to rendering.
     *
     * @param current - The current state.
     * @param next - The next state.
     */
    public update(
        current?: Immutable<IBaseGameObject>,
        next?: Immutable<IBaseGameObject>,
    ): void {
        super.update(current, next);
    }

    /**
     * Renders the GameObject, this is the main method that developers will
     * override in the inheriting class to render them via game logic.
     *
     * @param dt - A floating point number [0, 1) which represents how far into
     * the next turn that current turn we are rendering is at.
     * @param current - The current (most) game state, will be this.next if
     * this.current is null.
     * @param next - The next (most) game state, will be this.current if
     * this.next is null.
     * @param reason - The reason for the current delta.
     * @param nextReason - The reason for the next delta.
     */
    public render(
        dt: number,
        current: Immutable<IBaseGameObject>,
        next: Immutable<IBaseGameObject>,
        reason: Immutable<DeltaReason>,
        nextReason: Immutable<DeltaReason>,
    ): void {
        this.renderLogs(dt, current, next);
    }

    /**
     * Intended to be overridden by classes that have a player color so they
     * can re-color themselves when a player color changes
     * Also automatically invoked after initialization
     */
    public recolor(): void {
        // do nothing, if a game object can be recolored, then it should
        // override this function.
    }

    /**
     * Invoked when the state updates. Intended to be overridden by
     * subclass(es).
     *
     * @param current - The current (most) game state, will be this.next if
     * this.current is null.
     * @param next - The next (most) game state, will be this.current if
     * this.next is null.
     * @param reason - The reason for the current delta.
     * @param nextReason - The reason for the next delta.
     */
    public stateUpdated(
        current: Immutable<IBaseGameObject>,
        next: Immutable<IBaseGameObject>,
        reason: Immutable<DeltaReason>,
        nextReason: Immutable<DeltaReason>,
    ): void {
        // Intended to be overridden by inheriting classes,
        // no need to call this super.
    }

    /**
     * Gets the unique context menu items, intended to be overridden by
     * subclasses.
     *
     * @returns An array of items valid for a ContextMenu.
     */
    protected getContextMenu(): MenuItems {
        return [];
    }

    /**
     * Invoked when this game object's container is clicked.
     *
     * @param event - The click event.
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
     * Invoked when this game object's container is right clicked, to pull up
     * its context menu.
     *
     * @param event - The pixi event from the right click.
     */
    private rightClicked(event: PIXI.interaction.InteractionEvent): void {
        const scale = this.viseur.settings.resolutionScale.get();
        this.showContextMenu(
            event.data.global.x / scale,
            event.data.global.y / scale,
        );
    }

    // Context Menus \\

    /**
     * Displays a context menu (right click menu) over this game object.
     *
     * @param x - The x coordinate where it should be shown (in pixels).
     * @param y - The y coordinate where it should be shown (in pixels).
     */
    private showContextMenu(x: number, y: number): void {
        this.renderer.showContextMenu(this.getFullContextMenu(), x, y);
    }

    /**
     * Gets the full context menu (getContextMenu + getBottomContextMenu) and
     * removes unneeded separators.
     *
     * @returns Any array of items valid for a ContextMenu.
     */
    private getFullContextMenu(): MenuItems {
        const menu = [
            ...this.getContextMenu(),
            ...this.getBottomContextMenu(),
        ];

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
     * Gets the bottom part of the context menu to be automatically appended to the regular getContextMenu part.
     * It should be a separator + Inspect.
     *
     * @returns Any array of items valid for a ContextMenu.
     */
    private getBottomContextMenu(): MenuItems {
        return [
            "---",
            {
                icon: "code",
                text: "Inspect",
                description: "Reveals this GameObject in the Inspector so you can examine variable values.",
                callback: () => {
                    // TODO: implement
                    // this.emit("inspect");
                },
            },
        ];
    }

    /**
     * Render the most recently logged text above this game object.
     *
     * @param dt - The delta time.
     * @param current - The current most state.
     * @param next - The next state.
     */
    private renderLogs(
        dt: number,
        current: Immutable<IBaseGameObject>,
        next: Immutable<IBaseGameObject>,
    ): void {
        if (this.container && next && next.logs) {
            if (next.logs.length > 0
                && this.viseur.settings.showLoggedText.get()
            ) {
                const alpha = (current.logs.length < next.logs.length)
                    ? ease(dt, "cubicInOut") // fade it in
                    : 1; // fully visible;

                // then they logged a string, so show it above their head
                const str = next.logs[next.logs.length - 1];

                if (!this.loggedPixiText) {
                    this.loggedPixiText = this.renderer.newPixiText(
                        str,
                        this.container,
                        { fill: Color("white").hex() },
                        0.25,
                    );
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
