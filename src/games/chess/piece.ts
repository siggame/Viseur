// This is a class to represent the Piece object in the game.
// If you want to render it in the game do so here.
import { MenuItems } from "src/core/ui/context-menu";
import { Viseur } from "src/viseur";
import { IDeltaReason } from "src/viseur/game";
import { Game } from "./game";
import { GameObject } from "./game-object";
import { IMoveState, IPieceState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
import * as PIXI from "pixi.js";
import { ease, IPoint } from "src/utils";
import { Player } from "./player";

const PIECE_TYPE_TO_INDEX: Readonly<{[pieceType: string]: number}> = Object.freeze({
    Bishop: 0,
    King: 1,
    Knight: 2,
    Pawn: 3,
    Queen: 4,
    Rook: 5,
}) as any;
// <<-- /Creer-Merge: imports -->>

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class Piece extends GameObject {
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
    public readonly game!: Game; // set in super constructor

    /** The current state of the Piece (dt = 0) */
    public current: IPieceState | undefined;

    /** The next state of the Piece (dt = 1) */
    public next: IPieceState | undefined;

    // <<-- Creer-Merge: variables -->>

    /** The player that owns this piece */
    private readonly owner: Player;

    /** The initial type of this piece, used to determine promotion */
    private readonly initialType: string;

    /** The initial sprite for this piece */
    private readonly spriteInitial: PIXI.Container;

    /** If this was a pawn, and got promoted, the new promoted sprite */
    private spritePromoted?: PIXI.Container;

    /** An offset from the bottom of it's tile to look better */
    private readonly bottomOffset = 0.125;

    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Piece with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this Piece
     * @param Visuer the Viseur instance that controls everything and contains
     * the game.
     */
    constructor(state: IPieceState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        this.container.setParent(this.game.piecesContainer);
        this.owner = this.game.gameObjects[state.owner.id] as Player;
        this.spriteInitial = this.createSprite(state.type);
        this.initialType = state.type;
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Piece
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
    public render(dt: number, current: IPieceState, next: IPieceState,
                  reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.render(dt, current, next, reason, nextReason);

        // <<-- Creer-Merge: render -->>
        if (current.captured) { // then we don't exist to be rendered
            this.container.visible = false;
            return; // no need to figure out where to render, as it's now invisible
        }
        // else, we are visible and need to be rendered on the screen somewhere
        this.container.visible = true;

        const currentPosition = this.transformFileRank(current.file, current.rank);
        let nextPosition = this.transformFileRank(next.file, next.rank);

        if (!current.captured && next.captured) { // then we got captured :(
            nextPosition = currentPosition; // as next nextPosition would be off map
            this.container.alpha = ease(1 - dt, "cubicInOut"); // fade it out
        }
        else {
            this.container.alpha = 1; // fulls visible, as they are not captured
        }

        // now actually move us on screen
        this.container.position.set(
            ease(currentPosition.x, nextPosition.x, dt, "cubicInOut"),
            ease(currentPosition.y, nextPosition.y, dt, "cubicInOut"),
        );

        if (this.game.settings.flipBoard.get()) { // then we need to flip our vertical position
            // flip it so the y is inverted (board height is 8, so 7 because we index at 0)
            this.container.y = 7 - this.container.y;
        }

        this.container.y -= this.bottomOffset; // push it up a bit to look better

        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this Piece's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        let color = this.game.getPlayersColor(this.owner).rgbNumber();

        // if black or white, soften the color
        switch (color) {
            case 0x000000:
                color = 0x58585A;
                break;
            case 0xFFFFFF:
                color = 0xD1D2D4;
                break;
        }
        (this.spriteInitial.getChildByName("front") as PIXI.Sprite).tint = color;

        if (this.spritePromoted) {
            (this.spritePromoted.getChildByName("front") as PIXI.Sprite).tint = color;
        }
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
    public stateUpdated(current: IPieceState, next: IPieceState,
                        reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: state-updated -->>

        // check to see if we need to find the promoted sprite
        if (!this.spritePromoted && this.initialType !== (this.next || this.current!).type) {
            // then we've been promoted
            this.spritePromoted = this.createSprite((next || current).type);
            this.recolor();
        }
        else if (this.spritePromoted) {
            // then we need to display the correct sprite if at this state is has or has not been promoted
            const isPawn = (current.type.toLowerCase() === "pawn");

            this.spriteInitial.visible = isPawn;
            this.spritePromoted.visible = !isPawn;
        }
        this.spriteInitial.visible = true; // TODO: remove
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // NOTE: past this block are functions only used 99% of the time if
    //       the game supports human playable clients (like Chess).
    //       If it does not, feel free to ignore everything past here.

    // <Joueur functions> --- functions invoked for human playable client

    /**
     * Moves the Piece from its current location to the given rank and file.
     * @param file The file coordinate to move to. Must be [a-h].
     * @param rank The rank coordinate to move to. Must be [1-8].
     * @param promotionType If this is a Pawn moving to the end of the board
     * then this parameter is what to promote it to. When used must be 'Queen',
     * 'Knight', 'Rook', or 'Bishop'.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is The Move you did if successful,
     * otherwise null if invalid. In addition if your move was invalid you will
     * lose.
     */
    public move(file: string, rank: number, promotionType: string, callback?:
                (returned: IMoveState) => void,
    ): void {
        this.runOnServer("move", {file, rank, promotionType}, callback);
    }

    // </Joueur functions>

    /**
     * Invoked when the right click menu needs to be shown.
     * @returns an array of context menu items, which can be
     *          {text, icon, callback} for items, or "---" for a separator
     */
    protected getContextMenu(): MenuItems {
        const menu = super.getContextMenu();

        // <<-- Creer-Merge: get-context-menu -->>
        const state = this.current || this.next;
        if (this.game.humanPlayer && this.game.selectedPiece && state && state.file && state.rank) {
            const pos = state.file + state.rank;
            menu.push({
                text: `Move here ${pos}`,
                description: "Moves the piece to this position and ends your turn",
                icon: "map-marker",
                callback: () => {
                    // it exists as from the above check
                    this.game.humanPlayer!.handleTileClicked(pos);
                },
            });
        }

        menu.push({
            text: "Show valid moves",
            description: "Highlight all the valid moves for this piece",
            icon: "eye",
            callback: () => {
                this.game.showValidMovesFor(this.id);
            },
        });
        // <<-- /Creer-Merge: get-context-menu -->>

        return menu;
    }

    // <<-- Creer-Merge: protected-private-functions -->>

    /**
     * Creates a new sprite from a piece type
     * @param type the type of the chess piece
     * @returns the pixi container with the parts of that type
     */
    private createSprite(type: string): PIXI.Container {
        const index = PIECE_TYPE_TO_INDEX[type];
        const container = new PIXI.Container();
        container.setParent(this.container);

        this.game.resources.piecesBottom.newSprite(container, index, {
            tint: this.owner.color.rgbNumber(),
            name: "back",
        });

        this.game.resources.piecesTop.newSprite(container, index, {
            name: "front",
        });

        return container;
    }

    /**
     * Transforms a (file, rank) coordinate to (x, y), e.g.: ('a', 1) -> (0, 7).
     *   This assumes that the origin for a chess board is the bottom left at a1,
     *   and rendering is done at 0,0 being in the top left.
     *
     * @param file the file position
     * @param rank the rank position
     * @returns and object with an x, y coordinate between [0, 7] for both
     */
    private transformFileRank(file: string, rank: number): IPoint {
        return {
            x: file.toLowerCase().charCodeAt(0) - "a".charCodeAt(0),
            y: 8 - rank,
        };
    }

    // <<-- /Creer-Merge: protected-private-functions -->>
}
