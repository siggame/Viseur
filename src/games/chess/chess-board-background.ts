import { Square } from "chess.js";
import * as Color from "color";
import * as PIXI from "pixi.js";
import { getContrastingColor } from "src/utils";
import { createEventEmitter } from "ts-typed-events";
import { Game } from "./game";

/** The ASCII code for the character 'a'. */
export const ASCII_A = "a".charCodeAt(0);

/** The margin around the board. */
export const BOARD_MARGIN = 0.5;

/** The length of the board, 8x8. */
export const BOARD_LENGTH = 8; // 8x8 tiles for standard chess board

/** The margin on each side, plus the 8 chess tiles. */
export const BOARD_LENGTH_WITH_MARGINS = BOARD_MARGIN * 2 + BOARD_LENGTH;

/**
 * Converts an number 0-8 -> a-h.
 *
 * @param x - The number to convert.
 * @returns The number as string a-h.
 */
function xToChar(x: number): string {
    return String.fromCharCode(ASCII_A + x);
}

/** Manager class that maintains state about the chess board background. */
export class ChessBoardBackground {
    /** Emitter for tile clicked event. */
    private readonly emitTileClicked = createEventEmitter<Square>();

    /** Emitted when a tile is clicked. The square clicked is emitted. */
    public readonly eventTileClicked = this.emitTileClicked.event;

    /** The container for the board itself. */
    public readonly boardContainer = new PIXI.Container();

    /** The random color used to make each board a little unique. */
    public readonly randomColor = Color.hsl(
        this.game.random() * 360,
        60,
        40,
    ).whiten(1.5);

    /** The complimentary color for this random color. */
    public readonly randomColorCompliment = this.randomColor.rotate(180);

    /** The color of the rank/file text. */
    private readonly textColor = Color.rgb(222, 222, 222);

    /** The background color overlay. */
    private readonly backgroundGraphics = new PIXI.Graphics();

    // private readonly tileBorderLength = 0.9;

    /** The sprites used to make tiles on the board. */
    private readonly tileSprites = [] as PIXI.Sprite[][];

    /** The container for all the tiles. */
    private readonly tileContainer = new PIXI.Container();

    // private readonly overlayContainer = new PIXI.Container()
    //     .setParent(this.boardContainer);

    /** The PIXI.Text instances used to display the rank/file strings. */
    private readonly gridStrings = {
        rank: [[], []] as [PIXI.Text[], PIXI.Text[]],
        file: [[], []] as [PIXI.Text[], PIXI.Text[]],
    };

    /**
     * Creates a new instance given a game to grab resources from.
     *
     * @param game - The game this is a background for.
     */
    constructor(private readonly game: Game) {
        this.game.layers.background.addChild(this.backgroundGraphics);

        this.boardContainer.setParent(this.game.layers.background);
        this.tileContainer.setParent(this.boardContainer);

        this.boardContainer.position.set(BOARD_MARGIN, BOARD_MARGIN);

        const textOptions = {
            height: BOARD_MARGIN / 2,
            fill: this.textColor.rgbNumber(),
        };

        // for each side, left/right
        for (const ranks of this.gridStrings.rank) {
            // vertical ranks, 1, 2, 3, ...8
            for (let rank = 1; rank <= 8; rank++) {
                const rankText = this.game.renderer.newPixiText(
                    String(rank),
                    this.game.layers.background,
                    textOptions,
                );
                rankText.alpha = 0.75;
                rankText.anchor.set(0.5);

                ranks[rank] = rankText;
            }
        }

        // and again, for the top and bottom
        for (const files of this.gridStrings.file) {
            // horizontal files, a, b, c, ...h
            for (let file = 1; file <= 8; file++) {
                const character = xToChar(file - 1);
                const fileText = this.game.renderer.newPixiText(
                    character,
                    this.game.layers.background,
                    textOptions,
                );
                fileText.alpha = 0.75;
                fileText.anchor.set(0.5);

                files[file] = fileText;
            }
        }

        // make all the tiles
        for (let x = 0; x < 8; x++) {
            this.tileSprites[x] = [];
            for (let y = 0; y < 8; y++) {
                const resource = this.game.resources[
                    (x + y) % 2 ? "tileBlack" : "tileWhite"
                ];
                const tile = resource.newSprite({
                    container: this.tileContainer,
                    onClick: () => {
                        const square = (xToChar(x) + String(8 - y)) as Square;
                        // check to make certain above as Square check is valid
                        if (!this.game.currentChess.SQUARES.includes(square)) {
                            throw new Error(`Invalid square at (${x}, ${y})!`);
                        }

                        this.emitTileClicked(square);
                    },
                });

                this.tileSprites[x][y] = tile;
            }
        }

        this.flipBackground(this.game.settings.flipBoard.get());
        this.game.settings.flipBoard.changed.on((flipped) =>
            this.flipBackground(flipped),
        );

        const recolor = () => this.recolor();
        this.game.settings.boardColor.changed.on(recolor);
        this.game.settings.blackSquareContrast.changed.on(recolor);
        this.game.settings.whiteSquareContrast.changed.on(recolor);
        this.recolor();
    }

    /** Recolors the board based on settings. */
    public recolor(): void {
        const colorSetting = this.game.settings.boardColor.get();

        const color =
            colorSetting === "#000000"
                ? this.randomColor.darken(0.75)
                : Color(colorSetting);

        // fill in the background, which displays the file/rank, and the "tiles"
        this.backgroundGraphics
            .clear()
            .beginFill(color.rgbNumber(), 1)
            .drawRect(
                0,
                0,
                BOARD_LENGTH_WITH_MARGINS,
                BOARD_LENGTH_WITH_MARGINS,
            )
            .endFill();

        const textColor = getContrastingColor(color);
        const texts = this.gridStrings.rank
            .concat(this.gridStrings.file)
            .flatMap((t) => t);

        for (const text of texts) {
            text.tint = textColor.rgbNumber();
        }

        for (let x = 0; x < 8; x++) {
            const tiles = this.tileSprites[x];
            for (let y = 0; y < 8; y++) {
                const tile = tiles[y];
                const setting = this.game.settings[
                    (x + y) % 2 ? "blackSquareContrast" : "whiteSquareContrast"
                ];

                tile.alpha = setting.get();
            }
        }
    }

    /**
     * This is setup above to be called when the `flip-board` setting is changed.
     *
     * @param flipped - To render the background as flipped or not.
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
}
