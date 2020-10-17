// This is a class to represent the Unit object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { NewtonianDelta, TileState, UnitState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import * as PIXI from "pixi.js";
import { ease, isObject, pixiFade, updown } from "src/utils";
import { GameBar } from "src/viseur/game";
import { Tile } from "./tile";

const OVER_SCALE = 0.1;
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Unit extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Unit (dt = 0). */
    public current: UnitState | undefined;

    /** The next state of the Unit (dt = 1). */
    public next: UnitState | undefined;

    // <<-- Creer-Merge: variables -->>
    /** The id of the owner of this unit, for recoloring. */
    public ownerID: string;

    /** Sprite for our job title. */
    public jobSprite: PIXI.Sprite;

    /** The tile state of the tile we are attacking, if we are. */
    public attackingTile?: TileState;

    /** Our health bar. */
    public readonly healthBar: GameBar;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Unit with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Unit.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: UnitState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        // You can initialize your new Unit here.
        this.ownerID = state.owner.id;
        this.container.scale.set(OVER_SCALE + 1, OVER_SCALE + 1);
        this.container.position.x -= OVER_SCALE / 2;

        const jobContainer = new PIXI.Container();
        jobContainer.setParent(this.container);
        this.addSprite[`${state.job.title}Bottom` as "internBottom"]({
            container: jobContainer,
        });
        this.jobSprite = this.addSprite[
            `${state.job.title}Top` as "internTop"
        ]({ container: jobContainer });

        if (state.owner.id === this.game.players[0].id) {
            // flip the first player's job sprite
            jobContainer.scale.x *= -1;
            jobContainer.position.x += 1;
        }

        const barContainer = new PIXI.Container();
        barContainer.setParent(this.container);
        barContainer.position.y -= 0.25;

        this.healthBar = new GameBar(barContainer, {
            max: state.job.health,
            visibilitySetting: this.game.settings.displayHealthBars,
        });
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Unit
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
        current: Immutable<UnitState>,
        next: Immutable<UnitState>,
        delta: Immutable<NewtonianDelta>,
        nextDelta: Immutable<NewtonianDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        // render where the Unit is

        // No longer on the map.
        if (!next.tile) {
            this.container.visible = false;

            return;
        }
        this.container.visible = true;
        this.container.position.set(
            ease(current.tile.x, next.tile.x, dt),
            ease(current.tile.y, next.tile.y, dt),
        );

        this.healthBar.update(ease(current.health, next.health, dt));
        pixiFade(this.container, dt, current.health, next.health);

        if (this.attackingTile) {
            const d = updown(dt);
            const dx = (this.attackingTile.x - current.tile.x) / 2;
            const dy = (this.attackingTile.y - current.tile.y) / 2;

            this.container.x += dx * d;
            this.container.y += dy * d;
        }
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Unit's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        const color = this.game.getPlayersColor(this.ownerID).rgbNumber();
        this.jobSprite.tint = color;
        this.healthBar.recolor(color);
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Unit instance should not be rendered,
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
        current: Immutable<UnitState>,
        next: Immutable<UnitState>,
        delta: Immutable<NewtonianDelta>,
        nextDelta: Immutable<NewtonianDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Unit based off its states
        this.attackingTile = undefined;
        if (
            nextDelta.type === "ran" &&
            nextDelta.data.run.caller.id === this.id
        ) {
            if (nextDelta.data.returned) {
                const { run } = nextDelta.data;
                const tile = this.game.gameObjects[
                    String(isObject(run.args.tile) && run.args.tile.id)
                ];

                switch (run.functionName) {
                    case "attack":
                        this.attackingTile =
                            tile && (tile as Tile).getNextMostState();
                }
            }
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
     * Makes the unit do something to a machine or unit adjacent to its tile.
     * Interns sabotage, physicists work. Interns stun physicist, physicist
     * stuns manager, manager stuns intern.
     *
     * @param tile - The tile the unit acts on.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully acted,
     * false otherwise.
     */
    public act(tile: TileState, callback: (returned: boolean) => void): void {
        this.runOnServer("act", { tile }, callback);
    }

    /**
     * Attacks a unit on an adjacent tile.
     *
     * @param tile - The Tile to attack.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully attacked,
     * false otherwise.
     */
    public attack(
        tile: TileState,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("attack", { tile }, callback);
    }

    /**
     * Drops materials at the units feet or adjacent tile.
     *
     * @param tile - The tile the materials will be dropped on.
     * @param amount - The number of materials to dropped. Amounts <= 0 will
     * drop all the materials.
     * @param material - The material the unit will drop. 'redium', 'blueium',
     * 'redium ore', or 'blueium ore'.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully deposited,
     * false otherwise.
     */
    public drop(
        tile: TileState,
        amount: number,
        material: "redium ore" | "redium" | "blueium" | "blueium ore",
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("drop", { tile, amount, material }, callback);
    }

    /**
     * Moves this Unit from its current Tile to an adjacent Tile.
     *
     * @param tile - The Tile this Unit should move to.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if it moved, false
     * otherwise.
     */
    public move(tile: TileState, callback: (returned: boolean) => void): void {
        this.runOnServer("move", { tile }, callback);
    }

    /**
     * Picks up material at the units feet or adjacent tile.
     *
     * @param tile - The tile the materials will be picked up from.
     * @param amount - The amount of materials to pick up. Amounts <= 0 will
     * pick up all the materials that the unit can.
     * @param material - The material the unit will pick up. 'redium',
     * 'blueium', 'redium ore', or 'blueium ore'.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully deposited,
     * false otherwise.
     */
    public pickup(
        tile: TileState,
        amount: number,
        material: "redium ore" | "redium" | "blueium" | "blueium ore",
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("pickup", { tile, amount, material }, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
