// This is a class to represent the Game object in the game.
// If you want to render it in the game do so here.
import { Delta } from "@cadre/ts-utils/cadre";
import * as Color from "color";
import { Immutable } from "src/utils";
import { BaseGame } from "src/viseur/game";
import { IRendererSize } from "src/viseur/renderer";
import { GameObjectClasses } from "./game-object-classes";
import { HumanPlayer } from "./human-player";
import { GameResources } from "./resources";
import { GameSettings } from "./settings";
import { IGameState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>

const ASCII_A = "a".charCodeAt(0);
const BOARD_MARGIN = 0.5;
const BOARD_LENGTH = 8; // 8x8 tiles for standard chess board
const BOARD_LENGTH_WITH_MARGINS = (BOARD_MARGIN * 2) + BOARD_LENGTH; // margin on each side, plus the 8 chess tiles

// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Game extends BaseGame {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The static name of this game. */
    public static readonly gameName = "Chess";

    /** The number of players in this game. the players array should be this same size */
    public static readonly numberOfPlayers = 2;

    /** The current state of the Game (dt = 0) */
    public current: IGameState | undefined;

    /** The next state of the Game (dt = 1) */
    public next: IGameState | undefined;

    /** The resource factories that can create sprites for this game */
    public readonly resources = GameResources;

    /** The human player playing this game */
    public readonly humanPlayer: HumanPlayer | undefined;

    /** The default player colors for this game, there must be one for each player */
    public readonly defaultPlayerColors: [Color, Color] = [
        // <<-- Creer-Merge: default-player-colors -->>
        Color("white"),
        Color("black"),
        // <<-- /Creer-Merge: default-player-colors -->>
    ];

    /** The custom settings for this game */
    public readonly settings = this.createSettings(GameSettings);

    /** The layers in the game */
    public readonly layers = this.createLayers({
        // <<-- Creer-Merge: layers -->>
        /** Bottom most layer, for background elements */
        background: this.createLayer(),
        /** Middle layer, for moving game objects */
        game: this.createLayer(),
        /** Top layer, for UI elements above the game */
        ui: this.createLayer(),
        // <<-- /Creer-Merge: layers -->>
    });

    /** Mapping of the class names to their class for all sub game object classes */
    public readonly gameObjectClasses = GameObjectClasses;

    // <<-- Creer-Merge: variables -->>

    private readonly textColor = Color.rgb(222, 222, 222);
    // private readonly tileBorderLength = 0.9;

    private readonly tileSprites = [] as PIXI.Sprite[][];

    private readonly randomColor = Color.hsl(this.random() * 360, 60, 40).whiten(1.5);
    // private readonly randomColorCompliment = this.randomColor.rotate(180);

    private readonly boardContainer = new PIXI.Container()
        .setParent(this.layers.game);

    private readonly tileContainer = new PIXI.Container()
        .setParent(this.boardContainer);

    // private readonly overlayContainer = new PIXI.Container()
    //     .setParent(this.boardContainer);

    private readonly gridStrings = {
        rank: [[], []] as [PIXI.Text[], PIXI.Text[]],
        file: [[], []] as [PIXI.Text[], PIXI.Text[]],
    };

    // <<-- /Creer-Merge: variables -->>

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Invoked when the first game state is ready to setup the size of the renderer.
     *
     * @param state - The initialize state of the game.
     * @returns The {height, width} you for the game's size.
     */
    protected getSize(state: IGameState): IRendererSize {
        return {
            // <<-- Creer-Merge: get-size -->>
            width: BOARD_LENGTH_WITH_MARGINS,
            height: BOARD_LENGTH_WITH_MARGINS,
            // <<-- /Creer-Merge: get-size -->>
        };
    }

    /**
     * Called when Viseur is ready and wants to start rendering the game.
     * This is where you should initialize your state variables that rely on game data.
     *
     * @param state - The initialize state of the game.
     */
    protected start(state: IGameState): void {
        super.start(state);

        // <<-- Creer-Merge: start -->>

        this.settings.flipBoard.changed.on((flipped) => this.flipBackground(flipped));

        // <<-- /Creer-Merge: start -->>
    }

    /**
     * Initializes the background. It is drawn once automatically after this step.
     *
     * @param state - The initial state to use the render the background.
     */
    protected createBackground(state: IGameState): void {
        super.createBackground(state);

        // <<-- Creer-Merge: create-background -->>

        const whiteColor = this.randomColor;
        // const whiteTopColor = whiteColor.lighten(0.15);
        // const blackColor = whiteColor.darken(0.5);
        // const blackTopColor = blackColor.lighten(0.15);
        const backgroundColor = whiteColor.darken(0.75);

        // fill in the background, which displays the file/rank, and the "tiles"
        this.layers.background.addChild(new PIXI.Graphics())
            .beginFill(backgroundColor.rgbNumber(), 1)
            .drawRect(0, 0, BOARD_LENGTH_WITH_MARGINS, BOARD_LENGTH_WITH_MARGINS)
            .endFill();

        this.boardContainer.x = BOARD_MARGIN;
        this.boardContainer.y = BOARD_MARGIN;

        const textOptions = {
            height: BOARD_MARGIN / 2,
            fill: this.textColor.rgbNumber(),
        };

        // for each side, left/right
        for (const ranks of this.gridStrings.rank) {
            // vertical ranks, 1, 2, 3, ...8
            for (let rank = 1; rank <= 8; rank++) {
                const rankText = this.renderer.newPixiText(String(rank), this.layers.background, textOptions);
                rankText.alpha = 0.75;
                rankText.anchor.set(0.5);

                ranks[rank] = rankText;
            }
        }

        // and again, for the top and bottom
        for (const files of this.gridStrings.file) {
            // horizontal files, a, b, c, ...h
            for (let file = 1; file <= 8; file++) {
                const character = String.fromCharCode(ASCII_A + file - 1);
                const fileText = this.renderer.newPixiText(character, this.layers.background, textOptions);
                fileText.alpha = 0.75;
                fileText.anchor.set(0.5);

                files[file] = fileText;
            }
        }

        // make all the tiles
        for (let x = 0; x < 8; x++) {
            this.tileSprites[x] = [];
            for (let y = 0; y < 8; y++) {
                const resource = this.resources[(x + y) % 2
                    ? "tileBlack"
                    : "tileWhite"
                ];
                const tile = resource.newSprite({ container: this.tileContainer, alpha: 0.175 });

                this.tileSprites[x][y] = tile;
            }
        }

        this.flipBackground(this.settings.flipBoard.get());
        // <<-- /Creer-Merge: create-background -->>
    }

    /**
     * Called approx 60 times a second to update and render the background.
     * Leave empty if the background is static.
     *
     * @param dt - A floating point number [0, 1) which represents how far into the next turn to render at.
     * @param current - The current (most) game state, will be this.next if this.current is undefined.
     * @param next - The next (most) game state, will be this.current if this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta  - The the next (most) delta, which explains what happend.
     */
    protected renderBackground(
        dt: number,
        current: Immutable<IGameState>,
        next: Immutable<IGameState>,
        delta: Immutable<Delta>,
        nextDelta: Immutable<Delta>,
    ): void {
        super.renderBackground(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render-background -->>
        // update and re-render whatever you initialize in renderBackground
        // <<-- /Creer-Merge: render-background -->>
    }

    /**
     * Invoked when the game state updates.
     *
     * @param current - The current (most) game state, will be this.next if this.current is undefined.
     * @param next - The next (most) game state, will be this.current if this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta  - The the next (most) delta, which explains what happend.
     */
    protected stateUpdated(
        current: Immutable<IGameState>,
        next: Immutable<IGameState>,
        delta: Immutable<Delta>,
        nextDelta: Immutable<Delta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Game based on its current and next states
        // <<-- /Creer-Merge: state-updated -->>
    }
    // <<-- Creer-Merge: protected-private-functions -->>

    /**
     * This is setup above to be called when the `flip-board` setting is changed
     *
     * @param flipped - To render the background as flipped or not
     */
    private flipBackground(flipped: boolean): void {
        // this._unselect();

        for (const [i, ranks] of this.gridStrings.rank.entries()) {
            const bottomRank = i === 0;
            for (let y = 1; y <= 8; y++) {
                const rankText = ranks[y];

                rankText.y = 9 - y;

                if (flipped) {
                    rankText.y = 9 - rankText.y;
                }

                rankText.x = BOARD_MARGIN / 2;

                if (bottomRank) {
                    rankText.x += BOARD_MARGIN + BOARD_LENGTH;
                }
            }
        }

        for (const [i, files] of this.gridStrings.file.entries()) {
            const bottomFile = i === 0;
            for (let x = 1; x <= 8; x++) {
                const fileText = files[x];

                fileText.x = x;
                fileText.y = BOARD_MARGIN / 2;

                if (bottomFile) {
                    fileText.y += BOARD_MARGIN + 8;
                }
            }
        }

        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const sprite = this.tileSprites[x][y];

                sprite.x = x;
                sprite.y = flipped ? 7 - y : y;
            }
        }
    }
    // <<-- /Creer-Merge: protected-private-functions -->>
}
