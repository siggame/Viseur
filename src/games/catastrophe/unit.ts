// This is a class to represent the Unit object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { CatastropheDelta, TileState, UnitState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
import * as Color from "color";
import { ease, updown } from "src/utils"; // updown
import { GameBar } from "src/viseur/game";
import { JobState } from "./state-interfaces";
import { Tile } from "./tile";

const WHITE_COLOR = Color("white").rgbNumber();
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
// Set this variable to `true`, if this class should render.
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
    /** The id of the owner of the unit. */
    public ownerID?: string;

    /** Our job. */
    public job: JobState["title"];

    // Base sprite of the unit
    /** The cat sprite. */
    public catSprite: PIXI.Sprite;
    /** The human sprite. */
    public humanSprite: PIXI.Sprite;
    /** The builder sprite. */
    public builderSprite: PIXI.Sprite;
    /** The soldier sprite. */
    public soldierSprite: PIXI.Sprite;
    /** The gatherer sprite. */
    public gathererSprite: PIXI.Sprite;
    /** The converter sprite. */
    public converterSprite: PIXI.Sprite;

    /** The sprite we are using from the above. */
    public spriteInUse: PIXI.Sprite | undefined;

    /** An indicator sprite. */
    public indicatorSprite: PIXI.Sprite;

    // State Change Variables
    /** The tile we are attacking, if we are. */
    public attackingTile?: TileState;
    /** The tile we are harvesting from, if we are. */
    public harvestTile?: TileState;
    /** The job we changed to, if we did. */
    public jobChanged?: JobState["title"];
    /** The id of the player we are changing to, if we are. */
    public playerChange?: string;
    /** The direction we are facing. */
    public facing: "left" | "right";

    /** Drop shadow" sprite. */
    public dropShadow: PIXI.Sprite;

    /** The maximum amount of energy we can have. */
    public maxEnergy: number;

    /** The bar that display's this unit's health. */
    private readonly healthBar: GameBar;

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

        if (state.owner) {
            this.ownerID = state.owner.id;
        }
        this.job = state.job.title;

        this.container.setParent(this.game.layers.game);

        this.dropShadow = this.addSprite.dropShadow();

        const hide = { visible: false };
        this.catSprite = this.addSprite.catOverlord(hide);
        this.soldierSprite = this.addSprite.soldierUnit(hide);
        this.gathererSprite = this.addSprite.gathererUnit(hide);
        this.builderSprite = this.addSprite.builderHuman(hide);
        this.converterSprite = this.addSprite.converterUnit(hide);
        this.humanSprite = this.addSprite.freshHuman(hide);
        this.indicatorSprite = this.addSprite.indicator(hide);

        this.setJob(this.job);

        if (state.tile) {
            this.container.position.set(state.tile.x, state.tile.y);
            this.container.visible = true;
        } else {
            this.container.position.set(-1, -1);
            this.container.visible = false;
        }

        this.recolor();

        this.facing = "left";
        if (this.ownerID === "0") {
            this.facing = "right";
            this.container.scale.x *= -1;
        }

        this.maxEnergy = state.energy;
        this.healthBar = new GameBar(this.container);

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
        delta: Immutable<CatastropheDelta>,
        nextDelta: Immutable<CatastropheDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>

        // No longer on the map
        if (!next.tile) {
            this.container.visible = false;

            return;
        } else {
            this.container.visible = true;
        }

        if (
            current.tile.tileWest &&
            current.tile.tileWest.id === next.tile.id
        ) {
            if (this.facing !== "left") {
                this.facing = "left";
                this.container.scale.x *= -1;
            }
        }
        if (
            current.tile.tileEast &&
            current.tile.tileEast.id === next.tile.id
        ) {
            if (this.facing !== "right") {
                this.facing = "right";
                this.container.scale.x *= -1;
            }
        }

        let cX = current.tile.x;
        let nX = next.tile.x;
        if (this.facing === "right") {
            cX += 1;
            nX += 1;
        }

        this.container.position.set(
            ease(cX, nX, dt),
            ease(current.tile.y, next.tile.y, dt),
        );

        if (current.owner !== next.owner) {
            this.ownerID = next.owner && next.owner.id;
            this.recolor();
        }

        if (this.jobChanged) {
            // If Job Changed called by player and returned true
            if (this.jobChanged !== this.job) {
                this.setJob(this.jobChanged);
            }
        } else {
            // This would be a unit losing loyalty/ or the game state jumps
            if (this.job !== next.job.title) {
                this.setJob(next.job.title);
            }
        }

        let currEnergy;
        let nextEnergy;
        if (this.job === "fresh human" && !this.ownerID) {
            currEnergy = current.turnsToDie / 10; // Magic number 10 is max turns to die
            nextEnergy = next.turnsToDie / 10;
        } else {
            currEnergy = current.energy / this.maxEnergy;
            nextEnergy = next.energy / this.maxEnergy;
        }
        this.healthBar.update(ease(currEnergy, nextEnergy, dt));

        if (this.attackingTile) {
            if (
                current.tile.tileEast &&
                current.tile.tileEast.id === this.attackingTile.id
            ) {
                if (this.facing !== "right") {
                    this.facing = "right";
                    this.container.scale.x *= -1;
                }
            }
            if (
                current.tile.tileWest &&
                current.tile.tileWest.id === this.attackingTile.id
            ) {
                if (this.facing !== "left") {
                    this.facing = "left";
                    this.container.scale.x *= -1;
                }
            }

            const d = updown(dt);
            const dx = (this.attackingTile.x - current.tile.x) / 2;
            const dy = (this.attackingTile.y - current.tile.y) / 2;

            this.container.x += dx * d;
            this.container.y += dy * d;
        } /**/

        if (this.harvestTile) {
            if (
                current.tile.tileEast &&
                current.tile.tileEast.id === this.harvestTile.id
            ) {
                if (this.facing !== "right") {
                    this.facing = "right";
                    this.container.scale.x *= -1;
                }
            }
            if (
                current.tile.tileWest &&
                current.tile.tileWest.id === this.harvestTile.id
            ) {
                if (this.facing !== "left") {
                    this.facing = "left";
                    this.container.scale.x *= -1;
                }
            }

            const d = updown(dt);
            const dx = (this.harvestTile.x - current.tile.x) / 2;
            const dy = (this.harvestTile.y - current.tile.y) / 2;

            this.container.x += dx * d;
            this.container.y += dy * d;
        } /**/

        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Unit's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        this.dropShadow.tint =
            this.ownerID === undefined
                ? WHITE_COLOR
                : this.game.getPlayersColor(this.ownerID).rgbNumber();
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
        delta: Immutable<CatastropheDelta>,
        nextDelta: Immutable<CatastropheDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        this.attackingTile = undefined;
        this.harvestTile = undefined;
        this.jobChanged = undefined;
        if (
            nextDelta.type === "ran" &&
            nextDelta.data.run.caller.id === this.id
        ) {
            const { data } = nextDelta;
            const tile = this.game.getGameObject(data.run.args.tile, Tile);

            if (data.run.functionName === "attack" && data.returned) {
                this.attackingTile = tile && tile.getCurrentMostState();
            } else if (
                data.run.functionName === "changeJob" &&
                data.returned
            ) {
                this.jobChanged = String(
                    data.run.args.job,
                ) as JobState["title"];
            } else if (data.run.functionName === "harvest" && data.returned) {
                this.harvestTile = tile && tile.getCurrentMostState();
                this.indicatorSprite.visible = true;
            } else if (data.run.functionName === "drop" && data.returned) {
                this.indicatorSprite.visible = false;
            } else if (data.run.functionName !== "move" && data.returned) {
                // nothing special to render
            }
        }
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here

    /**
     * Sets our current job for rendering, which will change our sprites visible state(s).
     *
     * @param job - The title of the job we now have.
     */
    public setJob(job: JobState["title"]): void {
        if (this.spriteInUse) {
            this.spriteInUse.visible = false;
        }

        // job strings taken from game rules at
        // https://github.com/siggame/Cadre-MegaMinerAI-Dev/blob/master/Games/Catastrophe/rules.md
        if (job === "cat overlord") {
            this.spriteInUse = this.catSprite;
        }
        if (job === "soldier") {
            this.spriteInUse = this.soldierSprite;
        }
        if (job === "gatherer") {
            this.spriteInUse = this.gathererSprite;
        }
        if (job === "builder") {
            this.spriteInUse = this.builderSprite;
        }
        if (job === "missionary") {
            this.spriteInUse = this.converterSprite;
        }
        if (job === "fresh human") {
            this.spriteInUse = this.humanSprite;
        }
        this.job = job;
        if (this.spriteInUse) {
            this.spriteInUse.visible = true;
        }
    }

    // <<-- /Creer-Merge: public-functions -->>

    // <Joueur functions> --- functions invoked for human playable client
    // NOTE: These functions are only used 99% of the time if the game
    // supports human playable clients (like Chess).
    // If it does not, feel free to ignore these Joueur functions.

    /**
     * Attacks an adjacent Tile. Costs an action for each Unit in this Unit's
     * squad. Units in the squad without an action don't participate in combat.
     * Units in combat cannot move afterwards. Attacking structures will not
     * give materials.
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
     * Changes this Unit's Job. Must be at max energy (100) to change Jobs.
     *
     * @param job - The name of the Job to change to.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully changed
     * Jobs, false otherwise.
     */
    public changeJob(
        job: "soldier" | "gatherer" | "builder" | "missionary",
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("changeJob", { job }, callback);
    }

    /**
     * Constructs a Structure on an adjacent Tile.
     *
     * @param tile - The Tile to construct the Structure on. It must have enough
     * materials on it for a Structure to be constructed.
     * @param type - The type of Structure to construct on that Tile.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully constructed
     * a structure, false otherwise.
     */
    public construct(
        tile: TileState,
        type: "neutral" | "shelter" | "monument" | "wall" | "road",
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("construct", { tile, type }, callback);
    }

    /**
     * Converts an adjacent Unit to your side.
     *
     * @param tile - The Tile with the Unit to convert.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully converted,
     * false otherwise.
     */
    public convert(
        tile: TileState,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("convert", { tile }, callback);
    }

    /**
     * Removes materials from an adjacent Tile's Structure. You cannot
     * deconstruct friendly structures (see `Unit.attack`).
     *
     * @param tile - The Tile to deconstruct. It must have a Structure on it.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully
     * deconstructed, false otherwise.
     */
    public deconstruct(
        tile: TileState,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("deconstruct", { tile }, callback);
    }

    /**
     * Drops some of the given resource on or adjacent to the Unit's Tile. Does
     * not count as an action.
     *
     * @param tile - The Tile to drop materials/food on.
     * @param resource - The type of resource to drop ('materials' or 'food').
     * @param amount - The amount of the resource to drop. Amounts <= 0 will
     * drop as much as possible.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully dropped the
     * resource, false otherwise.
     */
    public drop(
        tile: TileState,
        resource: "materials" | "food",
        amount: number,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("drop", { tile, resource, amount }, callback);
    }

    /**
     * Harvests the food on an adjacent Tile.
     *
     * @param tile - The Tile you want to harvest.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully harvested,
     * false otherwise.
     */
    public harvest(
        tile: TileState,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("harvest", { tile }, callback);
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
     * Picks up some materials or food on or adjacent to the Unit's Tile. Does
     * not count as an action.
     *
     * @param tile - The Tile to pickup materials/food from.
     * @param resource - The type of resource to pickup ('materials' or 'food').
     * @param amount - The amount of the resource to pickup. Amounts <= 0 will
     * pickup as much as possible.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully picked up a
     * resource, false otherwise.
     */
    public pickup(
        tile: TileState,
        resource: "materials" | "food",
        amount: number,
        callback: (returned: boolean) => void,
    ): void {
        this.runOnServer("pickup", { tile, resource, amount }, callback);
    }

    /**
     * Regenerates energy. Must be in range of a friendly shelter to rest. Costs
     * an action. Units cannot move after resting.
     *
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully rested,
     * false otherwise.
     */
    public rest(callback: (returned: boolean) => void): void {
        this.runOnServer("rest", {}, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
