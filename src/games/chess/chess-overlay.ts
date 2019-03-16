import { Move, Square } from "chess.js";
import { Event, events } from "ts-typed-events";
import { squareToXY } from "./chess-pieces";
import { Game } from "./game";

/** An overlay on chess to handle clicks and show moves */
export class ChessOverlay {
    /** The events this overlay emits */
    public readonly events = events({
        /** Emitted when a valid move is selected. */
        moveSelected: new Event<Move>(),
    });

    /** re-usable pixi sprites to overlay on squares */
    private readonly overlays = new Array<PIXI.Sprite>();

    /** The currently selected square */
    private currentlySelected: Square | undefined;

    /** valid squares that represent a move */
    private validSquares: Move[] = [];

    /**
     * Creates a manager for the overlay.
     *
     * @param game - The game this is overlaying.
     */
    constructor(private readonly game: Game) {
        this.game.chessBackground.events.tileClicked.on((square) => this.tileClicked(square));
    }

    /**
     * Invoked whenever a tile is clicked on the board background so we can handle it.
     *
     * @param square - The chess square clicked.
     */
    private tileClicked(square: Square): void {
        this.deSelect();

        const wasSelected = this.currentlySelected;
        this.currentlySelected = square;

        if (wasSelected === square) {
            return; // don't show anything, they are de-selecting
        }

        const selectedMove = this.validSquares.find((m) => m.to === square);
        if (selectedMove) {
            this.validSquares.length = 0;
            this.currentlySelected = undefined;
            this.events.moveSelected.emit(selectedMove);

            return;
        }

        const movesFromSquare = this.game.nextChess
            .moves({ verbose: true })
            .filter((m) => m.from === square);

        this.validSquares = movesFromSquare;

        const from = squareToXY(square);
        const fromOverlay = this.getNextOverlay();
        fromOverlay.position.set(from.x, from.y);
        fromOverlay.alpha = 0.25;
        fromOverlay.tint = movesFromSquare.length > 0
            ? this.game.chessBackground.randomColorCompliment.rgbNumber()
            : 0xFFFFFF;

        for (const move of movesFromSquare) {
            const overlay = this.getNextOverlay();

            const to = squareToXY(move.to);
            overlay.position.set(to.x, to.y);
        }
    }

    /** Hides all overlays */
    private deSelect(): void {
        for (const overlay of this.overlays) {
            overlay.visible = false;
        }
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
