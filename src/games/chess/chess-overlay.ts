import { Move, Square } from "chess.js";
import { createEventEmitter } from "ts-typed-events";
import { BOARD_LENGTH } from "./chess-board-background";
import { squareToXY } from "./chess-pieces";
import { Game } from "./game";

/** An overlay on chess to handle clicks and show moves. */
export class ChessOverlay {
    /** Emitter for move selected event. */
    private readonly emitMoveSelected = createEventEmitter<Move>();

    /** Emitted when a valid move is selected. */
    public readonly eventMoveSelected = this.emitMoveSelected.event;

    /** Re-usable pixi sprites to overlay on squares. */
    private readonly overlays = new Array<PIXI.Sprite>();

    /** The currently selected square. */
    private currentlySelected: Square | undefined;

    /** Valid squares that represent a move. */
    private validSquares: Move[] = [];

    /**
     * Creates a manager for the overlay.
     *
     * @param game - The game this is overlaying.
     */
    constructor(private readonly game: Game) {
        this.game.chessBackground.eventTileClicked.on((square) =>
            this.tileClicked(square),
        );

        this.game.settings.flipBoard.changed.on(() => this.deSelect());
    }

    /**
     * Invoked whenever a tile is clicked on the board background so we can handle it.
     *
     * @param square - The chess square clicked.
     */
    private tileClicked(square: Square): void {
        const wasSelected = this.deSelect();
        this.currentlySelected = square;

        if (wasSelected === square) {
            return; // don't show anything, they are de-selecting
        }

        const selectedMove = this.validSquares.find((m) => m.to === square);
        if (selectedMove) {
            this.validSquares.length = 0;
            this.currentlySelected = undefined;
            this.emitMoveSelected(selectedMove);

            return;
        }

        const movesFromSquare = this.game.nextChess
            .moves({ verbose: true })
            .filter((m) => m.from === square);

        this.validSquares = movesFromSquare;

        const yOffset = (y: number) =>
            this.game.settings.flipBoard.get() ? BOARD_LENGTH - y - 1 : y;

        const from = squareToXY(square);
        const fromOverlay = this.getNextOverlay();
        fromOverlay.position.set(from.x, yOffset(from.y));
        fromOverlay.alpha = 0.25;
        fromOverlay.tint =
            movesFromSquare.length > 0
                ? this.game.chessBackground.randomColorCompliment.rgbNumber()
                : 0xffffff;

        for (const move of movesFromSquare) {
            const overlay = this.getNextOverlay();

            const to = squareToXY(move.to);
            overlay.position.set(to.x, yOffset(to.y));
        }
    }

    /**
     * Hides all overlays, and returns what was selected.
     *
     * @returns The square that was selected, if any.
     */
    private deSelect(): Square | undefined {
        for (const overlay of this.overlays) {
            overlay.visible = false;
        }

        const wasSelected = this.currentlySelected;
        this.currentlySelected = undefined;

        return wasSelected;
    }

    /**
     * Gets the next overlay to re-use, or makes a new one if none are available.
     *
     * @returns A new visible blank pixi sprite to use as an overlay.
     */
    private getNextOverlay(): PIXI.Sprite {
        const freeOverlay = this.overlays.find((o) => !o.visible);
        if (freeOverlay) {
            freeOverlay.visible = true;
            freeOverlay.alpha = 0.5;

            return freeOverlay;
        }

        const newOverlay = this.game.resources.overlay.newSprite({
            container: this.game.chessBackground.boardContainer,
            visible: true,
            alpha: 0.5,
            tint: this.game.chessBackground.randomColorCompliment.rgbNumber(),
        });

        this.overlays.push(newOverlay);

        return newOverlay;
    }
}
