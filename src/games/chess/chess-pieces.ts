import * as chessJs from "chess.js";
import { mapValues } from "lodash";
import { ASCII_A } from "./chess-board-background";
import { Game } from "./game";

const CHESS_PIECE_INDEXES = {
    b: 0, // Bishop
    k: 1, // King
    n: 2, // Knight
    p: 3, // Pawn
    q: 4, // Queen
    r: 5, // Rook
};

interface IPieceDou {
    bottom: PIXI.Sprite;
    top: PIXI.Sprite;
}

export class ChessPieces {
    private readonly pieceSpriteCache = mapValues(CHESS_PIECE_INDEXES, () => ([] as IPieceDou[])) as {
        [key in keyof typeof CHESS_PIECE_INDEXES]: IPieceDou[];
    };
    private readonly pieceSpriteUsed = mapValues(CHESS_PIECE_INDEXES, () => ([] as IPieceDou[])) as {
        [key in keyof typeof CHESS_PIECE_INDEXES]: IPieceDou[];
    };

    // TODO: fix types, for some reason being exported weird
    private chess: chessJs.ChessInstance = new (chessJs as any)(); // tslint:disable-line no-any no-unsafe-any

    constructor(private readonly game: Game) {}

    public update(fen: string, move: string | undefined): void {
        this.unRenderPieces();

        this.chess.load(fen);
        for (const square of this.chess.SQUARES) {
            const piece = this.chess.get(square);
            if (piece) {
                this.renderPieceAt(piece, square);
            }
        }
    }

    private renderPieceAt(piece: chessJs.Piece, at: chessJs.Square): void {
        const cache = this.pieceSpriteCache[piece.type];

        if (cache.length === 0) {
            const options = {
                container: this.game.layers.game,
                index: CHESS_PIECE_INDEXES[piece.type],
            };

            cache.push({
                bottom: this.game.resources.piecesBottom.newSprite(options), // bottom first to render below top
                top: this.game.resources.piecesTop.newSprite(options),
            });
        }

        // now there has to be a free sprite in the cache for us to use
        const duo = cache.shift() as IPieceDou;
        this.pieceSpriteUsed[piece.type].push(duo);

        // now render the duo of sprites at the proper positions
        const x = at.charCodeAt(0) - ASCII_A;
        const y = Number(at.charAt(1)) - 1;

        duo.bottom.visible = true;
        duo.bottom.position.set(x, y);
        duo.bottom.tint = piece.color === "b"
            ? 0x000000 // black
            : 0xFFFFFF; // white

        duo.top.visible = true;
        duo.top.position.set(x, y);

        // get the top color, if it is pure black or white, step it down for contrast,
        // otherwise it looks solid with the background
        let topColor = this.game.getPlayersColor(piece.color === "b" ? 1 : 0).rgbNumber();
        if (topColor === 0) {
            topColor = 0x555555;
        }
        else if (topColor === 0xFFFFFF) {
            topColor = 0xAAAAAA;
        }
        duo.top.tint = topColor;
    }

    private unRenderPieces(): void {
        for (const [t, duos] of Object.entries(this.pieceSpriteUsed)) {
            for (const duo of duos) {
                duo.bottom.visible = false;
                duo.top.visible = false;
            }
            this.pieceSpriteCache[t as keyof typeof CHESS_PIECE_INDEXES].concat(duos);
            duos.length = 0;
        }
    }
}
