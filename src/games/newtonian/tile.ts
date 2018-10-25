// This is a class to represent the Tile object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { Viseur } from "src/viseur";
import { IDeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { GameObject } from "./game-object";
import { ITileState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
//import * as Color from "color";
import { Player } from "./player";
// any additional imports you want can be added here safely between Creer runs
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class Tile extends GameObject {
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
        //return super.shouldRender; // change this to true to render all instances of this class
        return true;
        // <<-- /Creer-Merge: should-render -->>
    }

    /** The instance of the game this game object is a part of */
    public readonly game!: Game; // set in super constructor

    /** The current state of the Tile (dt = 0) */
    public current: ITileState | undefined;

    /** The next state of the Tile (dt = 1) */
    public next: ITileState | undefined;

    // <<-- Creer-Merge: variables -->>
    public floor: PIXI.Sprite;

    public wall: PIXI.Sprite;

    public genRoom: PIXI.Sprite;

    public conveyor: PIXI.Sprite;

    public owner?: Player;
    public spawn: PIXI.Sprite;

    public isGen: boolean; 
    public isCon: boolean;
    // You can add additional member variables here
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Tile with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this Tile
     * @param Visuer the Viseur instance that controls everything and contains
     * the game.
     */
    constructor(state: ITileState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        
        if (state.owner) {
            this.owner = this.game.gameObjects[state.owner.id] as Player;
        }
        
        // Initialize if it is a Generator Tile.
        this.isGen = state.type === "generator" ? true : false;
        this.isCon = state.type === "conveyor"  ? true : false;
        
        this.container.setParent(this.game.layers.background);

        this.spawn = this.game.resources.spawn.newSprite(this.container);
        this.spawn.visible = false;
        
        
        this.floor = this.game.resources.floor.newSprite(this.container);
        this.floor.visible = false;
        this.wall = this.game.resources.wall.newSprite(this.container);
        this.wall.visible = false;
        this.genRoom = this.game.resources.genRoom.newSprite(this.container);
        this.genRoom.visible = false;
        this.conveyor = this.game.resources.conveyor.newSprite(this.container);
        this.conveyor.visible = false;
                

        this.container.position.set(state.x, state.y);

        this.recolor();
        // You can initialize your new Tile here.
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Tile
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
    public render(dt: number, current: ITileState, next: ITileState,
                  reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>


        if(current.isWall) {
            this.wall.visible = true;
        }
        else if(this.owner) {
            if(this.isGen) {
                this.genRoom.visible = true;
            } 
            else{
                this.spawn.visible = true;
            }
        }
        else if(this.isCon) {
            this.conveyor.visible = true;
        }
        else{
            this.floor.visible = true;
        }
        // render where the Tile is
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this Tile's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        if(this.owner){
            const ownerColor = this.game.getPlayersColor(this.owner);
            this.spawn.tint = ownerColor.rgbNumber();
            this.genRoom.tint = ownerColor.rgbNumber();
        }
        // replace with code to recolor sprites based on player color
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
    public stateUpdated(current: ITileState, next: ITileState,
                        reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        // update the Tile based off its states
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
