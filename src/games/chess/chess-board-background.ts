import * as Color from "color";
import { Game } from "./game";

/** The ASCII code for the character 'a'. */
export const ASCII_A = "a".charCodeAt(0);

/** The margin around the board. */
export const BOARD_MARGIN = 0.5;

/** The length of the board, 8x8 */
export const BOARD_LENGTH = 8; // 8x8 tiles for standard chess board

/** // margin on each side, plus the 8 chess tiles */
export const BOARD_LENGTH_WITH_MARGINS = (BOARD_MARGIN * 2) + BOARD_LENGTH;

/** Manager class that maintains state about the chess board background. */
export class ChessBoardBackground {
    /** The color of the rank/file text. */
    private readonly textColor = Color.rgb(222, 222, 222);
    // private readonly tileBorderLength = 0.9;

    /** The sprites used to make tiles on the board. */
    private readonly tileSprites = [] as PIXI.Sprite[][];

    /** The random color used to make each board a little unique. */
    private readonly randomColor = Color.hsl(this.game.random() * 360, 60, 40).whiten(1.5);
    // private readonly randomColorCompliment = this.randomColor.rotate(180);

    /** The container for the board itself */
    private readonly boardContainer = new PIXI.Container();

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
        this.boardContainer.setParent(this.game.layers.game);
        this.tileContainer.setParent(this.boardContainer);

        const whiteColor = this.randomColor;
        // const whiteTopColor = whiteColor.lighten(0.15);
        // const blackColor = whiteColor.darken(0.5);
        // const blackTopColor = blackColor.lighten(0.15);
        const backgroundColor = whiteColor.darken(0.75);

        // fill in the background, which displays the file/rank, and the "tiles"
        this.game.layers.background.addChild(new PIXI.Graphics())
            .beginFill(backgroundColor.rgbNumber(), 1)
            .drawRect(0, 0, BOARD_LENGTH_WITH_MARGINS, BOARD_LENGTH_WITH_MARGINS)
            .endFill();

        const textOptions = {
            height: BOARD_MARGIN / 2,
            fill: this.textColor.rgbNumber(),
        };

        // for each side, left/right
        for (const ranks of this.gridStrings.rank) {
            // vertical ranks, 1, 2, 3, ...8
            for (let rank = 1; rank <= 8; rank++) {
                const rankText = this.game.renderer.newPixiText(String(rank), this.game.layers.background, textOptions);
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
                const fileText = this.game.renderer.newPixiText(character, this.game.layers.background, textOptions);
                fileText.alpha = 0.75;
                fileText.anchor.set(0.5);

                files[file] = fileText;
            }
        }

        // make all the tiles
        for (let x = 0; x < 8; x++) {
            this.tileSprites[x] = [];
            for (let y = 0; y < 8; y++) {
                const resource = this.game.resources[(x + y) % 2
                    ? "tileBlack"
                    : "tileWhite"
                ];
                const tile = resource.newSprite({ container: this.tileContainer, alpha: 0.175 });

                this.tileSprites[x][y] = tile;
            }
        }

        this.flipBackground(this.game.settings.flipBoard.get());
        this.game.settings.flipBoard.changed.on((flipped) => this.flipBackground(flipped));
    }

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
}
