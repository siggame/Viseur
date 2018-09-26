// This is a class to represent the Game object in the game.
// If you want to render it in the game do so here.
import * as Color from "color";
import { BaseGame, IDeltaReason } from "src/viseur/game";
import { IRendererSize } from "src/viseur/renderer";
import { GameObjectClasses } from "./game-object-classes";
import { HumanPlayer } from "./human-player";
import { GameResources } from "./resources";
import { GameSettings } from "./settings";
import { IGameState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import { Chess, ChessInstance, Move } from "chess.js";
import { IPoint } from "src/utils";
import { RendererResource } from "src/viseur/renderer";
import { Piece } from "./piece";
import { IPieceState } from "./state-interfaces";
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class Game extends BaseGame {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The static name of this game. */
    public static readonly gameName: string = "Chess";

    /** The number of players in this game. the players array should be this same size */
    public readonly numberOfPlayers: number = 2;

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
        Color("white"), // Player 0
        Color("black"), // Player 1
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
    /** The selected piece the human has selected */
    public selectedPiece?: Piece;

    /** The valid moves for the current most game state */
    public validMoves: Move[] = [];

    /** The container for pieces on the board */
    public readonly piecesContainer = new PIXI.Container();

    /** The random color used to make the board look different per game */
    public readonly randomColor = Color().hsl(this.chance.floating({min: 0, max: 360}), 60, 40).whiten(1.5);

    /** The compliment of the random color, used for UI on top of the background */
    private readonly randomColorCompliment = this.randomColor.rotate(180).opaquer(0.333);

    /** The border length around the board to render rank/file numbers */
    private readonly borderLength = 0.5;

    /** The strings that label each rank */
    private readonly rankStrings: PIXI.Text[][] = [];

    /** The strings that label each file */
    private readonly fileStrings: PIXI.Text[][] = [];

    /** The sprites for each tile, in a 2d array */
    private readonly tileSprites: PIXI.Sprite[][] = [];

    /** The UI sprite indicating where a piece is moving to */
    private spriteTo!: PIXI.Sprite;

    /** The UI sprite indicating where a piece is moving from */
    private spriteFrom!: PIXI.Sprite;

    /** If we've updated the chess.js instance with the current fen */
    private chessUpdated: boolean = false;

    /** The chess.js instance used to track game state */
    private readonly chess: ChessInstance = new Chess();

    /** All the tiles currently highlighted for UI usage */
    private readonly highlightedLocations: IPoint[] = [];

    // <<-- /Creer-Merge: variables -->>

    // <<-- Creer-Merge: public-functions -->>

    /**
     * Highlights the tiles that are valid moves for a piece by id
     * @param pieceID - id of the piece to find valid moves for
     */
    public showValidMovesFor(pieceID: string): void {
        this.updateChess();

        this.unselect();
        this.selectedPiece = this.gameObjects[pieceID] as Piece;

        const piece = this.selectedPiece;
        const pieceState = (piece.current || piece.next!);
        const from = pieceState.file + pieceState.rank;
        const fromPos = this.getXY(from);

        this.spriteFrom.position.set(fromPos.x, this.flipY(fromPos.y));
        this.spriteFrom.visible = true;

        if (this.next) {
            const nextPieceState = this.next.gameObjects[pieceID]as IPieceState;
            const toPos = this.getXY(nextPieceState.file + nextPieceState.rank);

            this.spriteTo.position.set(toPos.x, this.flipY(toPos.y));
            this.spriteTo.visible = true;
        }

        for (const move of this.validMoves) {
            if (move.from === from) {
                const pos = this.getXY(move.to);

                // the _tileSprites y position does not need to be changed for flip-board
                this.tileSprites[pos.x][pos.y].tint = this.randomColorCompliment.rgbNumber();
                this.highlightedLocations.push(pos);
            }
        }
    }

    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Invoked when the first game state is ready to setup the size of the renderer
     * @param state the initialize state of the game
     * @returns the {height, width} you for the game's size.
     */
    protected getSize(state: IGameState): IRendererSize {
        return {
            // <<-- Creer-Merge: get-size -->>
            width: 8 + this.borderLength * 2,
            height: 8 + this.borderLength * 2,
            topOffset: this.borderLength,
            rightOffset: this.borderLength,
            bottomOffset: this.borderLength,
            leftOffset: this.borderLength,
            // <<-- /Creer-Merge: get-size -->>
        };
    }

    /**
     * Called when Viseur is ready and wants to start rendering the game.
     * This is where you should initialize stuff.
     * @param state the initialize state of the game
     */
    protected start(state: IGameState): void {
        super.start(state);

        // <<-- Creer-Merge: start -->>
        this.settings.flipBoard.changed.on((flipped) => {
            this.flipBackground(flipped);
        });
        // <<-- /Creer-Merge: start -->>
    }

    /**
     * initializes the background. It is drawn once automatically after this step.
     * @param state the initial state to use the render the background
     */
    protected createBackground(state: IGameState): void {
        super.createBackground(state);

        // <<-- Creer-Merge: create-background -->>
        const backgroundColor = this.randomColor.darken(0.75);

        // the background, which displays the file/rank, and the "tiles"
        const length = 8 + this.borderLength * 2;
        this.layers.background.addChild(new PIXI.Graphics())
            .beginFill(backgroundColor.rgbNumber(), 1)
            .drawRect(0, 0, length, length)
            .endFill();

        // render the board
        const boardContainer = new PIXI.Container();
        boardContainer.setParent(this.layers.background);
        boardContainer.position.set(this.borderLength, this.borderLength);

        const tileContainer = new PIXI.Container();
        tileContainer.setParent(boardContainer);

        const overlayContainer = new PIXI.Container();
        overlayContainer.setParent(boardContainer);

        this.piecesContainer.setParent(boardContainer);

        const textOptions: PIXI.TextStyleOptions = {
            fill: 0xDEDEDE,
        };

        for (let i = 0; i < 2; i++) {
            const ranks: PIXI.Text[] = [];
            this.rankStrings[i] = ranks;
            // vertical ranks
            for (let rank = 1; rank <= 8; rank++) {
                const rankText = this.renderer.newPixiText(
                    String(rank), this.layers.background, textOptions, this.borderLength / 2,
                );
                rankText.anchor.set(0.5);

                ranks[rank] = rankText;
            }

            const files: PIXI.Text[] = [];
            this.fileStrings[i] = files;
            // horizontal files
            for (let file = 1; file <= 8; file++) {
                const fileText = this.renderer.newPixiText(
                    String.fromCharCode("a".charCodeAt(0) + file - 1),
                    this.layers.background,
                    textOptions,
                    this.borderLength / 2,
                );
                fileText.anchor.set(0.5);

                files[file] = fileText;
            }
        }

        for (let x = 0; x < 8; x++) {
            this.tileSprites[x] = [];
            for (let y = 0; y < 8; y++) {
                const color = (x + y) % 2
                    ? "Black"
                    : "White";

                this.tileSprites[x][y] = (this.resources[`tile${color}`] as RendererResource).newSprite(tileContainer, {
                    onClick: () => this.tileClicked(x, y),
                    tint: this.randomColor,
                });
            }
        }

        this.spriteFrom = this.resources.blank.newSprite(overlayContainer, {
            visible: false,
            tint: this.randomColorCompliment,
            alpha: 0.5,
        });
        this.spriteTo = this.resources.blank.newSprite(overlayContainer, {
            visible: false,
            tint: this.randomColorCompliment,
            alpha: 0.5,
        });

        this.flipBackground(this.settings.flipBoard.get());
        // <<-- /Creer-Merge: create-background -->>
    }

    /**
     * Called approx 60 times a second to update and render the background.
     * Leave empty if the background is static.
     * @param dt a floating point number [0, 1) which represents how
     * far into the next turn that current turn we are rendering is at
     * @param current the current (most) game state, will be this.next if
     * this.current is undefined
     * @param next the next (most) game state, will be this.current if
     * this.next is undefined
     * @param reason the reason for the current delta
     * @param nextReason the reason for the next delta
     */
    protected renderBackground(dt: number, current: IGameState, next: IGameState,
                               reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.renderBackground(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render-background -->>
        // update and re-render whatever you initialize in renderBackground
        // <<-- /Creer-Merge: render-background -->>
    }

    /**
     * Invoked when the game state updates.
     * @param current the current (most) game state, will be this.next if
     * this.current is undefined
     * @param next the next (most) game state, will be this.current if
     * this.next is undefined
     * @param reason the reason for the current delta
     * @param nextReason the reason for the next delta
     */
    protected stateUpdated(current: IGameState, next: IGameState,
                           reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>
        this.chessUpdated = false;
        this.unselect();
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    /**
     * This is setup above to be called when the `flip-board` setting is changed
     * @param flipBoard if it is flipped
     */
    private flipBackground(flipBoard: boolean): void {
        this.unselect();

        let x = 0;
        let y = 0;

        for (let i = 0; i < 2; i++) {
            // vertical ranks
            const ranks = this.rankStrings[i];
            for (y = 1; y <= 8; y++) {
                const rankText = ranks[y];

                rankText.y = 9 - y;

                if (flipBoard) {
                    rankText.y = 9 - rankText.y;
                }

                rankText.x = this.borderLength / 2;

                if (i === 1) { // bottom
                    rankText.x += 8 + this.borderLength;
                }
            }

            // horizontal files
            const files = this.fileStrings[i];
            for (x = 1; x <= 8; x++) {
                const fileText = files[x];

                fileText.x = x;
                fileText.y = this.borderLength / 2;

                if (i === 1) { // bottom
                    fileText.y += 8 + this.borderLength;
                }
            }
        }

        for (x = 0; x < 8; x++) {
            for (y = 0; y < 8; y++) {
                this.tileSprites[x][y].position.set(x, flipBoard ? 7 - y : y);
            }
        }
    }

    /** Updates the chess.js instance tracking the game */
    private updateChess(): void {
        if (!this.chessUpdated) {
            this.chessUpdated = true;

            this.chess.load((this.current || this.next!).fen);

            this.validMoves = this.chess.moves({ verbose: true });
        }
    }

    /**
     * flips a y coordinate based on the flip board setting
     * @param {number} y - y coordinate to flip
     * @returns {number} y coordinate flipped if needed
     */
    private flipY(y: number): number {
        return (this.settings.flipBoard.get()
            ? 7 - y
            : y
        );
    }

    /**
     * Transforms a chess coordinate to x,y   E.g. "a1" -> 0,0
     * @param {string} chessPosition a position valid to chess, with file then rank
     * @returns {Object} {x, y}, ranged [0, 7]
     */
    private getXY(chessPosition: string): IPoint {
        return {
            // first character ["a", "h"] -> [0, 7]
            x: chessPosition.charCodeAt(0) - "a".charCodeAt(0),
            // second character ["1", "8"] -> [0, 7], 7 - y to flip so that 0 is at the bottom, not top
            y: 7 - (Number(chessPosition.charAt(1)) - 1),
        };
    }

    /**
     * Transforms an (x, y) coordinate to a chess coordinate   E.g. 0,0 -> "a1"
     * @param {number} x - x coordinate, ranged [0, 7]
     * @param {number} y - y coordinate, ranged [0, 7]
     * @returns {string} a chess coordinate e.g. "a1"
     */
    private getFileRank(x: number, y: number): string {
        return String.fromCharCode("a".charCodeAt(0) + x) + (7 - y + 1);
    }

    /**
     * Invoked when a tile is clicked
     * @param {number} x - x coordinate
     * @param {number} y - y coordinate
     */
    private tileClicked(x: number, y: number): void {
        const pos = this.getFileRank(x, y);
        if (this.humanPlayer) {
            this.humanPlayer.handleTileClicked(pos);
        }

        this.unselect();
    }

    /**
     * Returns tiles to "normal" look if highlighted for movement lookup
     *
     * @private
     */
    private unselect(): void {
        if (!this.highlightedLocations) {
            return; // as we have not started yet
        }

        for (const loc of this.highlightedLocations) {
            this.tileSprites[loc.x][loc.y].tint = this.randomColor.rgbNumber();
        }

        this.highlightedLocations.length = 0;

        if (this.spriteTo) {
            this.spriteTo.visible = false;
            this.spriteFrom.visible = false;
        }

        this.selectedPiece = undefined;
    }
    // <<-- /Creer-Merge: protected-private-functions -->>
}
