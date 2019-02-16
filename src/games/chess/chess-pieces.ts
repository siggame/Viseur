import * as chessJs from "chess.js";
import { mapValues } from "lodash";
import { ease, IPoint } from "src/utils";
import { ASCII_A, BOARD_MARGIN } from "./chess-board-background";
import { Game } from "./game";

/** The SAN character for a chess piece type to their index in the sprite sheet. */
const CHESS_PIECE_INDEXES = {
    /** Bishop */
    b: 0,
    /** King */
    k: 1,
    /** Knight */
    n: 2,
    /** Pawn */
    p: 3,
    /** Queen */
    q: 4,
    /** Rook */
    r: 5,
};

/** A collection of PIXI components that make up a Piece being rendered. */
interface IPieceSprites {
    /** The bottom sprite, should always be solid black/white based on player color */
    bottom: PIXI.Sprite;
    /** The top color, should change based on player color/custom color. */
    top: PIXI.Sprite;
    /** The container holding both above sprites. */
    container: PIXI.Container;
}

/** An object detailing a piece that needs to be rendered. */
interface IPieceRender extends chessJs.Piece {
    /** Square moving from. Null when coming into existence (promotion). */
    from: chessJs.Square | null;
    /** Square moving to. Null when being captured or being promoted away from. */
    to: chessJs.Square | null;
    /** The sprites used to render this info. */
    sprites: IPieceSprites;
}

/** An object that maps to player colors that maps to an array of cached PIXI sprites for that piece/color combo. */
type SpritesCache = {
    [key in keyof typeof CHESS_PIECE_INDEXES]: {
        /** Black player's pieces of this type. */
        b: IPieceSprites[];
        /** White player's piece of this type. */
        w: IPieceSprites[];
    };
};

function squareToXY(square: chessJs.Square): IPoint {
    return {
        x: square.charCodeAt(0) - ASCII_A,
        y: Number(square.charAt(1)) - 1,
    };
}

/** Manager class that maintains state of chess pieces to render via PIXI. */
export class ChessPieces {
    /** The container holding all pieces */
    private readonly container = new PIXI.Container();

    /** The cache of unused piece sprites in memory ready to be re-used. */
    // tslint:disable-next-line:no-any no-unsafe-any - lodash has bad types, and loses keyof type information
    private readonly pieceSpriteCache = mapValues(CHESS_PIECE_INDEXES, () => ({ b: [], w: [] })) as any as SpritesCache;

    /** The cache of uses pieces being rendered on the board. */
    // tslint:disable-next-line:no-any no-unsafe-any - lodash has bad types, and loses keyof type information
    private readonly pieceSpriteUsed = mapValues(CHESS_PIECE_INDEXES, () => ({ b: [], w: [] })) as any as SpritesCache;

    // TODO: fix types, for some reason being exported weird
    /** The current chess state */
    private currentChess: chessJs.ChessInstance = new (chessJs as any)(); // tslint:disable-line no-any no-unsafe-any

    /** the next chess state */
    private nextChess: chessJs.ChessInstance = new (chessJs as any)(); // tslint:disable-line no-any no-unsafe-any

    /** A mapping of the square or promotion square to render information built during updates. */
    private renders = new Map<chessJs.Square | "promotion", IPieceRender>();

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
     * Update the states rendering. Pre-calculates as much as possible so render times are slim.
     *
     * @param fen - The current FEN string
     * @param moveSAN - optional SAN to apply to the current FEN to calculate the next state.
     */
    public update(fen: string, moveSAN: string | undefined): void {
        this.renders.clear();
        this.unRenderPieces();

        const tempSprites = this.pieceSpriteCache.b.b[0]; // TODO: dislike this

        // First, parse the current state, as most pieces in chess do not change state
        this.currentChess.load(fen);

        for (const square of this.currentChess.SQUARES) {
            const piece = this.currentChess.get(square);
            if (piece) {
                this.renders.set(square, {
                    ...piece,
                    from: square,
                    to: square, // assume all pieces do not move
                    sprites: tempSprites,
                });
            }
        }

        // Now look at the next state to update what moved/changed, if there is a SAN move
        this.nextChess.load(fen);
        const result = moveSAN && this.nextChess.move(moveSAN);

        if (result) {
            // first, let's check if something got captured
            let capturedSquare: chessJs.Square | undefined;
            if (result.flags.includes("e")) { // en passant capture
                capturedSquare = result.to[0] + result.from[1] as chessJs.Square;
            }
            else if (result.captured) { // normal capture via moving to captured piece
                capturedSquare = result.to;
            }

            if (capturedSquare) {
                this.getRenderUnsafe(capturedSquare).to = null; // it is not going anywhere, so fade it out
            }

            // now check for casteling, if so we need to animate the Rook moving with the King
            if (result.flags.includes("q") || result.flags.includes("k")) { // queen or king side castle
                const file = result.flags === "q" ? "a" : "h"; // queenside rook at file "a", kingside at "h"
                const rank = result.to[1];
                // queenside castle ends up at file "d", kingside at "f"
                const newRookSquare = (result.flags === "q" ? "d" : "f") + rank as chessJs.Square;

                const rookRender = this.getRenderUnsafe(file + rank).to = newRookSquare;
                if (!rookRender) {
                    throw new Error(`No rook for castling to render at ${rank}${file}!`);
                }
            }

            // now update the actual piece that moved
            this.getRenderUnsafe(result.from).to = result.to;

            if (result.promotion) {
                this.renders.set("promotion", {
                    type: result.promotion,
                    color: result.color,
                    from: null, // didn't exist, fade in
                    to: result.to,
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
                    bottom: this.game.resources.piecesBottom.newSprite(options), // bottom first to render below top
                    top: this.game.resources.piecesTop.newSprite(options),
                });
            }

            // now there has to be a free sprite in the cache for us to use
            const sprites = cache.pop() as IPieceSprites;
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
     * @param dt - The time delta, [0, 1)
     */
    public render(dt: number): void {
        for (const render of this.renders.values()) {
            // now let's figure out our alpha
            let alpha = 1;
            if (!render.to) {
                // going to null, fade out
                alpha = ease(1 - dt);
            }
            else if (!render.from) {
                // coming from null, fade in
                alpha = ease(dt);
            }
            // else it exists at to and from, so keep visible the whole time

            const to = render.to && squareToXY(render.to);
            const from = render.from && squareToXY(render.from);

            const position = from || to as IPoint; // one has to exist
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
            for (const colors of [this.pieceSpriteCache[safeKey], this.pieceSpriteUsed[safeKey]]) {
                for (const [color, pieceSprites] of Object.entries(colors)) {
                    for (const sprites of pieceSprites) {
                        sprites.bottom.tint = color === "b"
                            ? 0x000000 // black
                            : 0xFFFFFF; // white

                        // get the top color, if it is pure black or white, step it down for contrast,
                        // otherwise it looks solid with the background
                        let topColor = this.game.getPlayersColor(color === "b" ? 1 : 0).rgbNumber();
                        if (topColor === 0) {
                            topColor = 0x555555;
                        }
                        else if (topColor === 0xFFFFFF) {
                            topColor = 0xAAAAAA;
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
    private getRenderUnsafe(square: string): IPieceRender {
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
        for (const [t, usedSpritesByColor] of Object.entries(this.pieceSpriteUsed)) {
            const typeSafe = t as keyof typeof CHESS_PIECE_INDEXES;
            for (const [color, usedSprites] of Object.entries(usedSpritesByColor)) {
                const colorSafe = color as keyof typeof usedSpritesByColor;

                for (const sprite of usedSprites) {
                    sprite.container.visible = false;
                }
                this.pieceSpriteCache[typeSafe][colorSafe].push(...usedSprites);
                usedSprites.length = 0;
            }
        }
    }
}
