import {
    Delta,
    BaseGameObject as CadreBaseGameObject,
} from "@cadre/ts-utils/cadre";
import { Immutable, UnknownObject } from "src/utils/";
import { Viseur } from "src/viseur";
import { BaseGame } from "./base-game";
import { StateObject } from "./state-object";

/** The base class all GameObjects inherit from. */
export class BaseGameObject extends StateObject {
    /**
     * If this game object can be rendered. By default false to optimize
     * render loops.
     */
    public static readonly shouldRender: boolean = false;

    /** The ID of this game object. It will never change. */
    public readonly id: string;

    /** The class name as a string of the top level class this game object is, used primarily for reflection. */
    public readonly gameObjectName: string;

    /** The instance of the game this game object is a part of. */
    public readonly game: BaseGame;

    /** The current state (e.g. At delta time = 0). */
    public current: Immutable<CadreBaseGameObject> | undefined;

    /** The next state (e.g. At delta time = 1). */
    public next: Immutable<CadreBaseGameObject> | undefined;

    /** The Viseur instance that controls this game object. */
    protected readonly viseur: Viseur;

    /**
     * Initializes a BaseGameObject, should be invoked by subclass.
     *
     * @param initialState - Fully merged delta state for this object's first
     * existence.
     * @param viseur - The Viseur instance that controls this game object.
     */
    constructor(initialState: Immutable<CadreBaseGameObject>, viseur: Viseur) {
        super();

        this.id = initialState.id;
        this.gameObjectName = initialState.gameObjectName;

        this.viseur = viseur;
        this.game = viseur.game as BaseGame;
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
        args: Immutable<UnknownObject>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback?: (returned: any) => void,
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
        current?: Immutable<CadreBaseGameObject>,
        next?: Immutable<CadreBaseGameObject>,
    ): void {
        super.update(current, next);
    }

    /**
     * Renders the GameObject, this is the main method that developers will
     * override in the inheriting class to render them via game logic.
     *
     * @param dt - A floating point number [0, 1) which represents how far
     * into the next turn that current turn we are rendering is at.
     * @param current - The current (most) game state, will be this.next if
     * this.current is undefined.
     * @param next - The next (most) game state, will be this.current if
     * this.next is undefined.
     * @param reason - The reason for the current delta.
     * @param nextReason - The reason for the next delta.
     */
    public render(
        /* eslint-disable @typescript-eslint/no-unused-vars */
        dt: number,
        current: Immutable<CadreBaseGameObject>,
        next: Immutable<CadreBaseGameObject>,
        reason: Immutable<Delta>,
        nextReason: Immutable<Delta>,
        /* eslint-enable @typescript-eslint/no-unused-vars */
    ): void {
        // don't render by default
    }

    /**
     * Intended to be overridden by classes that have a player color so they
     * can re-color themselves when a player color changes.
     * Also automatically invoked after initialization.
     */
    public recolor(): void {
        // do nothing, if a game object can be recolored, then it should
        // override this function.
    }

    /**
     * Intended to be overridden by classes so they can hide everything when
     * this game object should not be rendered.
     */
    public hideRender(): void {
        // intended to be overridden.
    }

    /**
     * Invoked when the state updates. Intended to be overridden by
     * subclass(es).
     *
     * @param current - The current (most) game state, will be this.next if
     * this.current is undefined.
     * @param next - The next (most) game state, will be this.current if
     * this.next is undefined.
     * @param reason - The reason for the current delta.
     * @param nextReason - The reason for the next delta.
     */
    public stateUpdated(
        /* eslint-disable @typescript-eslint/no-unused-vars */
        current: Immutable<CadreBaseGameObject>,
        next: Immutable<CadreBaseGameObject>,
        reason: Immutable<Delta>,
        nextReason: Immutable<Delta>,
        /* eslint-enable @typescript-eslint/no-unused-vars */
    ): void {
        // Intended to be overridden by inheriting classes,
        // no need to call this super.
    }
}
