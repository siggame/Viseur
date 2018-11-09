// This is a class to represent the Tile object in the game.
// If you want to render it in the game do so here.
import { Delta } from "@cadre/ts-utils/cadre";
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { ITileState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// import * as Color from "color";
import { Player } from "./player";
// any additional imports you want can be added here safely between Creer runs
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
// Set this variable to `true`, if this class should render.
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Tile extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Tile (dt = 0) */
    public current: ITileState | undefined;

    /** The next state of the Tile (dt = 1) */
    public next: ITileState | undefined;

    // <<-- Creer-Merge: variables -->>
    public floor: PIXI.Sprite;
    public door: PIXI.Sprite;
    public openDoor: PIXI.Sprite;
    public eastDoor: PIXI.Sprite;
    public eastOpenDoor: PIXI.Sprite;

    public wall: PIXI.Sprite;

    public genRoom: PIXI.Sprite;

    public conveyor: PIXI.Sprite;

    public redOreSprite: PIXI.Sprite;
    public blueOreSprite: PIXI.Sprite;
    public redSprite: PIXI.Sprite;
    public blueSprite: PIXI.Sprite;

    public owner?: Player;
    public spawn: PIXI.Sprite;

    public isGen: boolean;
    public isCon: boolean;

    public isDecoration: number;

    public oreContainer: PIXI.Container;
    // You can add additional member variables here
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Tile with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Tile.
     * @param viseur - The Viseur instance that controls everything and contains the game.
     */
    constructor(state: ITileState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>

        if (state.owner) {
            this.owner = this.game.gameObjects[state.owner.id] as Player;
        }

        // Initialize if it is a Generator Tile.
        this.isGen = state.type === "generator" ? true : false;
        this.isCon = state.type === "conveyor" ? true : false;

        this.oreContainer = new PIXI.Container();
        this.oreContainer.setParent(this.game.layers.ore);

        this.container.setParent(this.game.layers.background);

        this.spawn = this.game.resources.spawn.newSprite({ container: this.container });
        this.spawn.visible = false;

        this.floor = this.game.resources.floor.newSprite({ container: this.container });
        this.floor.visible = false;
        this.door = this.game.resources.door.newSprite({ container: this.container });
        this.door.visible = false;
        this.openDoor = this.game.resources.openDoor.newSprite({ container: this.container });
        this.openDoor.visible = false;
        this.eastDoor = this.game.resources.eastDoor.newSprite({ container: this.container });
        this.eastDoor.visible = false;
        this.eastOpenDoor = this.game.resources.eastOpenDoor.newSprite({ container: this.container });
        this.eastOpenDoor.visible = false;
        this.wall = this.game.resources.wall.newSprite({ container: this.container });
        this.wall.visible = false;
        this.genRoom = this.game.resources.genRoom.newSprite({ container: this.container });
        this.genRoom.visible = false;
        this.conveyor = this.game.resources.conveyor.newSprite({ container: this.container });
        this.conveyor.visible = false;
        this.redOreSprite = this.game.resources.redore.newSprite({ container: this.container });
        this.redOreSprite.visible = false;
        this.blueOreSprite = this.game.resources.blueore.newSprite({ container: this.container });
        this.blueOreSprite.visible = false;
        this.redSprite = this.game.resources.red.newSprite({ container: this.oreContainer });
        this.redSprite.visible = false;
        this.blueSprite = this.game.resources.blue.newSprite({ container: this.oreContainer });
        this.blueSprite.visible = false;
        this.container.position.set(state.x, state.y);
        this.oreContainer.position.copy(this.container.position);

        this.isDecoration = state.decoration;

        this.recolor();
        // You can initialize your new Tile here.
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Tile instances.
     * Leave empty if it is not being rendered.
     *
     * @param dt - A floating point number [0, 1) which represents how far into
     * the next turn that current turn we are rendering is at
     * @param current - The current (most) game state, will be this.next if this.current is undefined.
     * @param next - The next (most) game state, will be this.current if this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta  - The the next (most) delta, which explains what happend.
     */
    public render(
        dt: number,
        current: Immutable<ITileState>,
        next: Immutable<ITileState>,
        delta: Immutable<Delta>,
        nextDelta: Immutable<Delta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        if (current.isWall) {
            this.wall.visible = true;
        }
        else if (this.owner) {
            if (this.isGen) {
                this.genRoom.visible = true;
            }
            else {
                this.spawn.visible = true;
            }
        }
        else if (this.isCon) {
            this.conveyor.visible = true;
        }
        else {
            if (!this.isDecoration) {
                this.floor.visible = true;
            }
            else {
                if (this.isDecoration === 2) {
                    if (!next.unit) {
                        this.door.visible = true;
                        this.openDoor.visible = false;
                    }
                    else {
                        this.door.visible = false;
                        this.openDoor.visible = true;
                    }
                }
                else {
                    if (!next.unit) {
                        this.eastDoor.visible = true;
                        this.eastOpenDoor.visible = false;
                    }
                    else {
                        this.eastDoor.visible = false;
                        this.eastOpenDoor.visible = true;
                    }
                }
            }
        }
        if (current.rediumOre > 0) {
            this.redOreSprite.visible = true;
        }
        else {
            this.redOreSprite.visible = false;
        }
        if (current.blueiumOre > 0) {
            this.blueOreSprite.visible = true;
        }
        else {
            this.blueOreSprite.visible = false;
        }
        if (current.blueium > 0) {
            this.blueSprite.visible = true;
        }
        else {
            this.blueSprite.visible = false;
        }
        if (current.redium > 0) {
            this.redSprite.visible = true;
        }
        else {
            this.redSprite.visible = false;
        }
        // render where the Tile is
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Tile's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        if (this.owner) {
            const ownerColor = this.game.getPlayersColor(this.owner);
            this.spawn.tint = ownerColor.rgbNumber();
            this.genRoom.tint = ownerColor.rgbNumber();
        }
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Tile instance should not be rendered,
     * such as going back in time before it existed.
     *
     * By default the super hides container.
     * If this sub class adds extra PIXI objects outside this.container, you should hide those too in here.
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
     * @param current - The current (most) game state, will be this.next if this.current is undefined.
     * @param next - The next (most) game state, will be this.current if this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta  - The the next (most) delta, which explains what happend.
     */
    public stateUpdated(
        current: Immutable<ITileState>,
        next: Immutable<ITileState>,
        delta: Immutable<Delta>,
        nextDelta: Immutable<Delta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Tile based off its states
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
