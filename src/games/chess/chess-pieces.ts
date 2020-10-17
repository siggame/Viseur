import * as chessJs from "chess.js";
import { mapValues } from "lodash";
import * as PIXI from "pixi.js";
import { ease, Point } from "src/utils";
import { ASCII_A, BOARD_LENGTH, BOARD_MARGIN } from "./chess-board-background";
import { Game } from "./game";

/** The SAN character for a chess piece type to their index in the sprite sheet. */
const CHESS_PIECE_INDEXES = {
    /** Bishop. */
    b: 0,
    /** King. */
    k: 1,
    /** Knight. */
    n: 2,
    /** Pawn. */
    p: 3,
    /** Queen. */
    q: 4,
    /** Rook. */
    r: 5,
};

/** A collection of PIXI components that make up a Piece being rendered. */
interface PieceSprites {
    /**
     * The bottom sprite, should always be solid black/white based on player
     * color.
     */
    bottom: PIXI.Sprite;
    /** The top color, should change based on player color/custom color. */
    top: PIXI.Sprite;
    /** The container holding both above sprites. */
    container: PIXI.Container;
}

/** An object detailing a piece that needs to be rendered. */
interface PieceRender extends chessJs.Piece {
    /** Square moving from. Null when coming into existence (promotion). */
    from: chessJs.Square | null;
    /**
     * Square moving to. Null when being captured or being promoted away from.
     */
    to: chessJs.Square | null;
    /** The sprites used to render this info. */
    sprites: PieceSprites;
}

/**
 * An object that maps to player colors that maps to an array of cached
 * PIXI sprites for that piece/color combo.
 */
type SpritesCache = {
    [key in keyof typeof CHESS_PIECE_INDEXES]: {
        /** Black player's pieces of this type. */
        b: PieceSprites[];
        /** White player's piece of this type. */
        w: PieceSprites[];
    };
};

/**
 * Takes a chess square and returns the (x, y) coordinates for them.
 *
 * @param square - The square to convert.
 * @returns A point for the given square.
 */
export function squareToXY(square: chessJs.Square): Point {
    return {
        x: square.charCodeAt(0) - ASCII_A,
        y: BOARD_LENGTH - Number(square.charAt(1)),
    };
}

/** Manager class that maintains state of chess pieces to render via PIXI. */
export class ChessPieces {
    /** The container holding all pieces. */
    private readonly container = new PIXI.Container();

    /** The cache of unused piece sprites in memory ready to be re-used. */
    private readonly pieceSpriteCache = mapValues(CHESS_PIECE_INDEXES, () => ({
        b: [],
        w: [],
    })) as SpritesCache;

    /** The cache of uses pieces being rendered on the board. */
    private readonly pieceSpriteUsed = mapValues(CHESS_PIECE_INDEXES, () => ({
        b: [],
        w: [],
    })) as SpritesCache;

    /**
     * A mapping of the square or promotion square to render information
     * built during updates.
     */
    private renders = new Map<chessJs.Square | "promotion", PieceRender>();

    /**
     * Creates a new piece render manager.
     *
     * @param game - The game this is rendering to grab resources from.
     */
    constructor(private readonly game: Game) {
        this.container.setParent(this.game.layers.game);
        this.container.position.set(BOARD_MARGIN, BOARD_MARGIN);
    }

    /**
     * Update the states rendering. Pre-calculates as much as possible so
     * render times are slim.
     *
     * @param chess - Chess.js instance of the current state.
     * @param move - If a move occurs AFTER the current state, the result of
     * that move, else null for no move.
     */
    public update(
        chess: chessJs.ChessInstance,
        move: chessJs.Move | null,
    ): void {
        this.renders.clear();
        this.unRenderPieces();

        const tempSprites = this.pieceSpriteCache.b.b[0]; // TODO: dislike this

        for (const square of chess.SQUARES) {
            const piece = chess.get(square);
            if (piece) {
                this.renders.set(square, {
                    ...piece,
                    from: square,
                    to: square, // assume all pieces do not move
                    sprites: tempSprites,
                });
            }
        }

        if (move) {
            // first, let's check if something got captured
            let capturedSquare: chessJs.Square | undefined;
            if (move.flags.includes("e")) {
                // en passant capture
                capturedSquare = (move.to[0] + move.from[1]) as chessJs.Square;
            } else if (move.captured) {
                // normal capture via moving to captured piece
                capturedSquare = move.to;
            }

            if (capturedSquare) {
                this.getRenderUnsafe(capturedSquare).to = null; // it is not going anywhere, so fade it out
            }

            // now check for casteling, if so we need to animate the Rook moving with the King
            if (move.flags.includes("q") || move.flags.includes("k")) {
                // queen or king side castle
                const file = move.flags === "q" ? "a" : "h"; // queenside rook at file "a", kingside at "h"
                const rank = move.to[1];
                // queenside castle ends up at file "d", kingside at "f"
                const newRookSquare = ((move.flags === "q" ? "d" : "f") +
                    rank) as chessJs.Square;

                const rookRender = (this.getRenderUnsafe(
                    file + rank,
                ).to = newRookSquare);
                if (!rookRender) {
                    throw new Error(
                        `No rook for castling to render at ${rank}${file}!`,
                    );
                }
            }

            // now update the actual piece that moved
            this.getRenderUnsafe(move.from).to = move.to;

            if (move.promotion) {
                this.renders.set("promotion", {
                    type: move.promotion,
                    color: move.color,
                    from: null, // didn't exist, fade in
                    to: move.to,
                    sprites: tempSprites,
                });
            }
        }

        // now hook up the real sprites
        let newSprites = false;
        for (const render of this.renders.values()) {
            const cache = this.pieceSpriteCache[render.type][render.color];

            if (cache.length === 0) {
                newSprites = true;
                const container = new PIXI.Container();
                container.setParent(this.container);

                const options = {
                    container,
                    index: CHESS_PIECE_INDEXES[render.type],
                };

                cache.push({
                    container,
                    bottom: this.game.resources.piecesBottom.newSprite(
                        options,
                    ), // bottom first to render below top
                    top: this.game.resources.piecesTop.newSprite(options),
                });
            }

            // now there has to be a free sprite in the cache for us to use
            const sprites = cache.pop() as PieceSprites;
            this.pieceSpriteUsed[render.type][render.color].push(sprites);

            sprites.container.visible = true; // must be visible this whole timespan
            render.sprites = sprites;
        }

        if (newSprites) {
            this.recolor();
        }
    }

    /**
     * Renders the current states given a time delta.
     *
     * @param dt - The time delta, [0, 1).
     */
    public render(dt: number): void {
        for (const render of this.renders.values()) {
            // now let's figure out our alpha
            let alpha = 1;
            if (!render.to) {
                // going to null, fade out
                alpha = ease(1 - dt);
            } else if (!render.from) {
                // coming from null, fade in
                alpha = ease(dt);
            }
            // else it exists at to and from, so keep visible the whole time

            const to = render.to && squareToXY(render.to);
            const from = render.from && squareToXY(render.from);

            if (this.game.settings.flipBoard.get()) {
                if (to) {
                    to.y = BOARD_LENGTH - to.y - 1;
                }
                if (from) {
                    from.y = BOARD_LENGTH - from.y - 1;
                }
            }

            const position = from || (to as Point); // one has to exist
            if (to && from && (to.x !== from.x || to.y !== from.y)) {
                // it's moving from a position to a position
                position.x = ease(from.x, to.x, dt);
                position.y = ease(from.y, to.y, dt);
            }

            render.sprites.container.alpha = alpha;
            render.sprites.container.position.set(position.x, position.y);
        }
    }

    /**
     * Recolors all the pieces, according to player color.
     */
    public recolor(): void {
        for (const key of Object.keys(CHESS_PIECE_INDEXES)) {
            const safeKey = key as keyof typeof CHESS_PIECE_INDEXES;
            for (const colors of [
                this.pieceSpriteCache[safeKey],
                this.pieceSpriteUsed[safeKey],
            ]) {
                for (const [color, pieceSprites] of Object.entries(colors)) {
                    for (const sprites of pieceSprites) {
                        sprites.bottom.tint =
                            color === "b"
                                ? 0x000000 // black
                                : 0xffffff; // white

                        // get the top color, if it is pure black or white, step it down for contrast,
                        // otherwise it looks solid with the background
                        let topColor = this.game
                            .getPlayersColor(color === "b" ? 1 : 0)
                            .rgbNumber();
                        if (topColor === 0) {
                            topColor = 0x555555;
                        } else if (topColor === 0xffffff) {
                            topColor = 0xaaaaaa;
                        }
                        sprites.top.tint = topColor;
                    }
                }
            }
        }
    }

    /**
     * Grabs a render for a given square, or throws an error if no render at that square.
     *
     * @param square - The chess square to get the render at.
     * @returns The render at that square. Throws if none.
     */
    private getRenderUnsafe(square: string): PieceRender {
        const render = this.renders.get(square as chessJs.Square);
        if (!render) {
            throw new Error(`No piece at ${square} to render to get!`);
        }

        return render;
    }

    /**
     * Remove all pieces currently being rendered, and caches them for re-use later.
     */
    private unRenderPieces(): void {
        for (const [t, usedSpritesByColor] of Object.entries(
            this.pieceSpriteUsed,
        )) {
            const typeSafe = t as keyof typeof CHESS_PIECE_INDEXES;
            for (const [color, usedSprites] of Object.entries(
                usedSpritesByColor,
            )) {
                const colorSafe = color as keyof typeof usedSpritesByColor;

                for (const sprite of usedSprites) {
                    sprite.container.visible = false;
                }
                this.pieceSpriteCache[typeSafe][colorSafe].push(
                    ...usedSprites,
                );
                usedSprites.length = 0;
            }
        }
    }
}
