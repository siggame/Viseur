// This is a class to represent the Building object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { IDeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { GameObject } from "./game-object";
import { IBuildingState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import * as Color from "color";
import * as PIXI from "pixi.js";
import { ease, renderSpriteBetween, unCapitalizeFirstLetter, updown } from "src/utils";
import { GameBar } from "src/viseur/game";
import { RendererResource } from "src/viseur/renderer";
import { Player } from "./player";

const FIRE_FRAMES = 5;
const RANDOM_MIN = -0.03;
const RANDOM_MAX = 0.03;
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class Building extends GameObject {
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
    public readonly game: Game;

    /** The current state of the Building (dt = 0) */
    public current: IBuildingState;

    /** The next state of the Building (dt = 1) */
    public next: IBuildingState;

    // <<-- Creer-Merge: variables -->>
    /** the beam color name to use for beams */
    protected get beamColorName(): number {
        return 0xFFFFFF;
    }

    /**
     * The "alive" building will have a top and bottom sprite, which we can
     * put in this container and threat them as one "object" for the
     * purposes for hiding and showing
     */
    private aliveContainer = new PIXI.Container();

    /** The owner of this building */
    private owner: Player;

    /** The back of the building (neutral colors) */
    private buildingSpriteBack: PIXI.Sprite;

    /** The front of the building (colored according to owner) */
    private buildingSpriteFront: PIXI.Sprite;

    /** The sprite we display when we are dead */
    private deadSprite: PIXI.Sprite;

    /** The bar that displays our health */
    private healthBar: GameBar;

    /** The visual graffiti displayed on the building indicating owner */
    private graffitiSprite: PIXI.Sprite;

    /** The graphic used when we are targeted by an enemy */
    private targetedSprite: PIXI.Sprite;

    /** Sprite we use when we are beaming some other building */
    private beamSprite: PIXI.Sprite;

    /** All the sprites from the fire spreadsheet to animate fire */
    private fireSprites: PIXI.Sprite[] = [];

    /** Random X number used to animate fire */
    private randomX = Math.random() * (RANDOM_MAX - RANDOM_MIN) + RANDOM_MIN;

    /** Random Y number used to animate fire */
    private randomY = Math.random() * (RANDOM_MAX - RANDOM_MIN) + RANDOM_MIN;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Building with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this Building
     * @param game the game this Building is in
     */
    constructor(state: IBuildingState, game: Game) {
        super(state, game);

        // <<-- Creer-Merge: constructor -->>
        this.container.setParent(this.game.layers.game);
        this.aliveContainer.setParent(this.container);

        // our owner's Player instance, needed to recolor ourself
        this.owner = this.game.gameObjects[state.owner.id] as any; // we know for certain the player will be there

        // This will be the sprite that shows our building, and we want to put
        // it inside our container.
        // The sprite key is just our class name (gameObjectName), which is set
        // to the appropriate sprite in textures/index.js
        // NOTE: // this is defensive programming.
        // We don't know if it will be upper or lower case, so we make sure it
        // will always be lower case regardless
        const base = unCapitalizeFirstLetter(state.gameObjectName);

        // the back sprite are neutral colors
        this.buildingSpriteBack = (this.game.resources[`${base}Back`] as RendererResource)
             .newSprite(this.aliveContainer);
        // and the front is a white map we will re-color to the team's color
        this.buildingSpriteFront = (this.game.resources[`${base}Front`] as RendererResource)
            .newSprite(this.aliveContainer);

        // when we die we need to look burnt up, so we want to initialize that sprite too
        this.deadSprite = this.game.resources.dead.newSprite(this.container);

        this.healthBar = new GameBar(this.container, {
            max: state.health,
            visibilitySetting: this.game.settings.displayHealthBars,
        });

        // now we need some nice fire sprites, notice they are a sprite sheet,
        // so we want a sprite for each part of the sheet
        this.fireSprites = [];
        for (let i = 0; i < FIRE_FRAMES; i++) {
            this.fireSprites.push(this.game.resources.fire.newSprite(this.container, i));
        }

        // the headquarters has no unique sprite, but instead a graffiti marking to easily make it stand out
        if (state.isHeadquarters) {
            // we have two players with id "0" and "1", so we use that to quickly get their graffiti sprite
            this.graffitiSprite = (this.game.resources[`graffiti${state.owner.id}`] as RendererResource).newSprite(
                this.aliveContainer, {
                    alpha: 0.9, // make it partially transparent because it looks nicer
                },
            );
        }

        // when we are the target on an attack, we'll highlight ourself so it's clear we are under attack
        this.targetedSprite = this.game.resources.beam.newSprite(this.container, {
            alpha: 0.666, // make it partially opaque so people can still tell what building we are
            tint: "red",
        });

        if (state.gameObjectName !== "WeatherStation") {
            // all the building classes shoot beams for animations,
            // except WeatherStations, we we'll just aggregate the logic here
            this.beamSprite = this.game.resources.beam.newSprite(this.game.layers.beams, {
                tint: Color(this.beamColorName).opaquer(0.5),
            });
        }

        // Also buildings never move, so let's move them right now
        // (normally you'd do that in render() if they moved dynamically)
        // NOTE: we move the container's (x, y), this is because that moves its
        // child sprites, the buildingSprite and deadSprite. That way we can
        // move 1 object and all the child nodes move too!
        this.container.x = state.x;
        this.container.y = state.y;
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Building
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
    public render(dt: number, current: IBuildingState, next: IBuildingState,
                  reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>

        // show our building sprite, as it's probably visible, and if not we'll set it to false later
        this.aliveContainer.alpha = 1;
        this.aliveContainer.visible = true;

        // if we are being targeted, then display out targetedSprite
        const run = nextReason && nextReason.run;
        const beingTargeted = run && (run.args.building === this || run.args.warehouse === this);
        this.targetedSprite.visible = beingTargeted;
        // and fade it out
        const targetedAlpha = ease(1 - dt, "cubicInOut");
        this.targetedSprite.alpha = targetedAlpha;

        let deadInBothStates = false;
        if (current.health === 0 || next.health === 0) {
            // it died at some point, so make the dead sprite visible
            this.deadSprite.visible = true;

            // we want to fade in/out the sprite based on if it currently died or not,
            // so we will use the alpha channel
            let alpha = 1;
            if (current.health === 0 && next.health === 0) {
                // it is dead, and remains dead, so just hide our normal sprite
                deadInBothStates = true;
                this.aliveContainer.visible = false;
            }
            else { // current.health !== 0 && next.health === 0, which means it burned down :(
                alpha = ease(dt, "cubicInOut"); // dt goes from 0 to 1, so at 0 we are not burned down, but as 1 we are
                // we want to ease out the buildingSprite in the opposite direction
                this.aliveContainer.alpha = 1 - alpha;
            }
            // else keep alpha at 1

            this.deadSprite.alpha = alpha;
        }
        else {
            // it had health through both states, so don't show the dead building sprite
            this.deadSprite.visible = false;
        }

        // update their health bar, if they want it to be displayed
        this.healthBar.update(ease(current.health, next.health, dt, "cubicInOut"));

        // now the correct building sprite is displayed
        // so let's look at the fire!

        for (let i = 0; i < FIRE_FRAMES; i++) {
            this.fireSprites[i].visible = false;
        }

        // for we need to figure out which fire sprite to use
        // we'll scale our current fire in the range [0, 20] to the sprite range [0, 5]
        const percentOnFire = current.fire / this.game.maxFire; // now we know a percentage of how "on fire" we are
        if (percentOnFire > 0) {
            // scale that percent to the fire sprite sheet index to represent how on fire we are
            const fireIndex = Math.round(percentOnFire * (FIRE_FRAMES - 1));
            const fireSprite = this.fireSprites[fireIndex];
            fireSprite.visible = true;

            if (this.game.settings.animateFire.get()) {
                const ud = updown(dt);
                fireSprite.position.set(this.randomX * ud, this.randomY * ud);
            }
        }

        // if we have a beam sprite, and it's visible, fade its alpha
        if (this.beamSprite && this.beamSprite.visible) {
            this.beamSprite.alpha = targetedAlpha; // re-use the alpha as we are the one targeting
        }

        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this Building's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // by adding their' owner's color's PIXI.ColorMatrixFilter, we recolor the sprite.
        // e.g. if a pixel is [1, 1, 1] (white) * [1, 0, 0.1] (red with a hint of blue) = [1*1, 1*0, 1*0.1]
        const color = this.game.getPlayersColor(this.owner);
        this.buildingSpriteFront.tint = color.lighten(0.15).rgbNumber();
        this.healthBar.recolor(color.lighten(0.5));
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
    public stateUpdated(current: IBuildingState, next: IBuildingState,
                        reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        // if this building shoots beams (is not a WeatherStation)
        if (this.beamSprite) {
            // assume it's not shooting a beam for this state
            this.beamSprite.visible = false;
            // but check if it is
            if (nextReason && nextReason.run && nextReason.run.caller === this && nextReason.returned > -1) {
                // and if it is the Building running a verb, show the beam shooting towards a target building
                this.beamSprite.visible = true;
                const args = nextReason.run.args;
                const building = args.building || args.warehouse;
                renderSpriteBetween(this.beamSprite, current, building.current);
            }
        }
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
