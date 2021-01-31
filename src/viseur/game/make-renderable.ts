import {
    Delta,
    BaseGameObject as CadreBaseGameObject,
} from "@cadre/ts-utils/cadre";
import * as Color from "color";
import * as PIXI from "pixi.js";
import { MenuItems } from "src/core/ui/context-menu";
import {
    Constructor,
    ease,
    getGameObjectDisplayText,
    Immutable,
} from "src/utils/";
import {
    createResourcesFor,
    ResourcesForGameObject,
} from "src/viseur/renderer";
import { BaseGameObject } from "./base-game-object";

/** The base constructor for any GameObject. */
type GameObjectConstructor = Constructor<BaseGameObject>;

/**
 * Mixes a GameObject class with the Renderable class so it can be rendered.
 *
 * @param GameObjectClass - The class constructor to mix in with.
 * @returns A new class, extends from the passed in class, now renderable.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function mixRenderableGameObject<T extends GameObjectConstructor>(
    GameObjectClass: T,
) {
    return class RenderableGameObjectMixed extends GameObjectClass {
        /** Renderable set to true to allow this game object and its sub classes can be rendered. */
        public static readonly shouldRender = true;

        /** The PIXI.Container used as the root for all pixi sprites attached to this game object during rendering. */
        public readonly container = new PIXI.Container();

        /** The renderer does all the heavily lifting for screen changes. */
        public readonly renderer = this.game.renderer;

        /** Factories to create new sprites as a part of this game object's container. */
        // eslint-disable-next-line @typescript-eslint/ban-types
        public readonly addSprite: ResourcesForGameObject<{}> = createResourcesFor(
            this,
            this.game.resources,
        );

        /** Pixi text to display the last logged string. */
        private loggedPixiText: PIXI.Text | undefined;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args: any[]) {
            super(...args);

            // initialize the container that will be rendered!
            this.container = new PIXI.Container();
            // add containers to the game layer by default
            // sub classes can move it if they please
            this.container.setParent(this.game.layers.game);

            // else make the container work for clicking
            this.container.interactive = true;

            const onClick = (e: PIXI.InteractionEvent) => {
                this.clicked(e);
            };
            /* Spell-checker:disable */
            this.container.on("mouseupoutside", onClick);
            this.container.on("mouseup", onClick);
            this.container.on("touchend", onClick);
            this.container.on("touchendoutside", onClick);

            const onRightClick = (e: PIXI.InteractionEvent) => {
                this.rightClicked(e);
            };
            this.container.on("rightup", onRightClick);
            this.container.on("rightupoutside", onRightClick);
            /* Spell-checker:enable */
        }

        /**
         * Renders the GameObject, this is the main method that developers will
         * override in the inheriting class to render them via game logic.
         *
         * @param dt - A floating point number [0, 1) which represents how far into
         * the next turn that current turn we are rendering is at.
         * @param current - The current (most) game state, will be this.next if this.current is undefined.
         * @param next - The next (most) game state, will be this.current if this.next is undefined.
         * @param delta - The reason for the current delta.
         * @param nextDelta - The reason for the next delta.
         */
        public render(
            dt: number,
            current: Immutable<CadreBaseGameObject>,
            next: Immutable<CadreBaseGameObject>,
            delta: Immutable<Delta>,
            nextDelta: Immutable<Delta>,
        ): void {
            super.render(dt, current, next, delta, nextDelta);

            this.container.visible = true;
            this.renderLogs(dt, current, next);
        }

        /**
         * Invoked when this game object should not be rendered, such as going back in time before it existed.
         *
         * By default hides the container. If your sub class adds extra PIXI objects outside the container you
         * should hide those too.
         */
        public hideRender(): void {
            super.hideRender();

            this.container.visible = false;
        }

        /**
         * Gets the unique context menu items.
         * Intended to be overridden by subclasses.
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        private clicked(event: PIXI.InteractionEvent): void {
            const menu = this.getContextMenu();
            if (menu.length > 0) {
                const item = menu[0];
                if (typeof item === "object") {
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
        private rightClicked(event: PIXI.InteractionEvent): void {
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
                    text: `Inspect ${getGameObjectDisplayText(
                        this.getCurrentMostState(),
                    )}`,
                    description:
                        "Reveals this GameObject in the Inspector so you can examine variable values.",
                    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
                    callback: () => {
                        this.game.eventInspect.emit(this);
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
            current: Immutable<CadreBaseGameObject>,
            next: Immutable<CadreBaseGameObject>,
        ): void {
            if (this.container && next && next.logs) {
                if (
                    next.logs.length > 0 &&
                    this.viseur.settings.showLoggedText.get()
                ) {
                    const alpha =
                        current.logs.length < next.logs.length
                            ? ease(dt, "cubicInOut") // fade it in
                            : 1; // fully visible

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
                } else if (this.loggedPixiText) {
                    this.loggedPixiText.visible = false;
                }
            }
        }
    };
}

/** A game object that has been mixed with Renderable. */
type MixedRenderableGameObject = ReturnType<typeof mixRenderableGameObject>;

/** An interface of a game object that has been mixed with renderable. */
type IRenderableGameObject = MixedRenderableGameObject;

/** A GameObject class that has been mixed the Renderable class mixin. */
export type RenderableGameObjectClass<
    T extends GameObjectConstructor = GameObjectConstructor
> = T & IRenderableGameObject;

/**
 * Makes a GameObject class renderable by mixing in the renderable mixin, when set to true.
 *
 * @param GameObjectClass - The GameObject class constructor to use as a base.
 * @param shouldRender - If it should be mixed.
 * @returns When shouldRender is false, it passes base the GameObjectClass, otherwise that class is mixed and returned.
 */
export function makeRenderable<
    T extends GameObjectConstructor,
    B extends boolean | undefined
>(
    GameObjectClass: T,
    shouldRender: B,
): B extends true
    ? RenderableGameObjectClass<T>
    : T extends IRenderableGameObject
    ? RenderableGameObjectClass<T>
    : T {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (shouldRender &&
    !((GameObjectClass as unknown) as typeof BaseGameObject).shouldRender
        ? mixRenderableGameObject(GameObjectClass)
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          GameObjectClass) as any; // that return conditional type mate
}
