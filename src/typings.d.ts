/**
 * The resulting handlebars template function from importing a hbs file
 * Takes in args to format the imported handlebars file into
 * @param args the arguments to apply to the templates
 * @returns {string} the template with args applied to it
 */
declare type Handlebars = (args?: {}) => string;

declare module "*.hbs" {
    const _: Handlebars;
    export = _;
}

declare module "*.json" {
    const _: {
        [key: number]: any;
        [key: string]: any;
    };

    export = _;
}

declare module "eases" {
    const _: {
        backInOut: (t: number) => number;
        backIn: (t: number) => number;
        backOut: (t: number) => number;
        bounceInOut: (t: number) => number;
        bounceIn: (t: number) => number;
        bounceOut: (t: number) => number;
        circInOut: (t: number) => number;
        circIn: (t: number) => number;
        circOut: (t: number) => number;
        cubicInOut: (t: number) => number;
        cubicIn: (t: number) => number;
        cubicOut: (t: number) => number;
        elasticInOut: (t: number) => number;
        elasticIn: (t: number) => number;
        elasticOut: (t: number) => number;
        expoInOut: (t: number) => number;
        expoIn: (t: number) => number;
        expoOut: (t: number) => number;
        linear: (t: number) => number;
        quadInOut: (t: number) => number;
        quadIn: (t: number) => number;
        quadOut: (t: number) => number;
        quartInOut: (t: number) => number;
        quartIn: (t: number) => number;
        quartOut: (t: number) => number;
        quintInOut: (t: number) => number;
        quintIn: (t: number) => number;
        quintOut: (t: number) => number;
        sineInOut: (t: number) => number;
        sineIn: (t: number) => number;
        sineOut: (t: number) => number;
    };
    export = _;
}

declare module "chess.js" {
    export interface IShortMove {
        /**
         * The location the piece is moving from.
         * Must be in san format, e.g "h8"
         */
        from: string;

        /**
         * The location the piece is moving to.
         * Must be in san format, e.g "a1"
         */
        to: string;

        /**
         * If this move results in a promotion, this will have the unit promotion.
         * - "n" for Knight
         * - "b" for Bishop
         * - "r" for Rook
         * - "q" for Queen
         */
        promotion?: "n" | "b" | "r" | "q";
    }

    export interface IMove extends IShortMove {
        /**
         * The color of the piece that moved
         * - "b" for Black
         * - "w" for White
         */
        color: "b" | "w";

        /** Flags indicating what occurred, combined into one string */
        flags: string;

        /** The Standard Algebraic Notation (SAN) representation of the move */
        san: string;

        /**
         * If an enemy piece was captured this is their type.
         * - "p" for Pawn
         * - "n" for Knight
         * - "b" for Bishop
         * - "r" for Rook
         * - "q" for Queen
         */
        captured?: "p" | "n" | "b" | "r" | "q";
    }

    export interface IPiece {
        /**
         * The type of the piece to place
         * - "p" for Pawn
         * - "n" for Knight
         * - "b" for Bishop
         * - "r" for Rook
         * - "q" for Queen
         * - "k" for King
         */
        type: "p" | "n" | "b" | "r" | "q" | "k";

        /**
         * The color of the piece
         * - "b" for Black
         * - "w" for White
         */
        color: "b" | "w";
    }

    export class Chess {
        /** The string that represents the White color side */
        public readonly WHITE: "w";

        /** The string that represents the Black color side */
        public readonly BLACK: "b";

        /** The string that represents a Pawn */
        public readonly PAWN: "p";

        /** The string that represents a Knight */
        public readonly KNIGHT: "n";
        /** The string that represents a Bishop */
        public readonly BISHOP: "b";

        /** The string that represents a Rook */
        public readonly ROOK: "r";

        /** The string that represents a Queen */
        public readonly QUEEN: "q";
        /** The string that represents a King */
        public readonly KING: "k";

        /** A list of all the squares in the game, from "a1" to "h8" */
        public readonly SQUARES: string[];

        /** Flags used to build flag strings for moves */
        public readonly FLAGS: {
            /** a non-capture */
            NORMAL: "n",
            /** a standard capture */
            CAPTURE: "c",
            /** a pawn push of two squares */
            BIG_PAWN: "b",
            /** an en passant capture */
            EP_CAPTURE: "e",
            /** a promotion */
            PROMOTION: "p",
            /** kingside castling */
            KSIDE_CASTLE: "k",
            /** queenside castling */
            QSIDE_CASTLE: "q",
        };

        /**
         * The Chess() constructor takes an optional parameter which specifies
         * the board configuration in Forsyth-Edwards Notation.
         * @param fen specifies the board configuration in Forsyth-Edwards Notation.
         */
        public constructor(fen?: string);

        /**
         * The board is cleared, and the FEN string is loaded.
         * Returns true if the position was successfully loaded, otherwise false
         * @param fen the fen formatted string to load
         * @returns true if the position was successfully loaded, otherwise
         * false
         */
        public load(fen: string): boolean;

        /**
         * Reset the board to the initial starting position.
         */
        public reset(): void;

        /**
         * Returns a list of legal moves from the current position.
         * The function takes an optional parameter which controls the
         * single-square move generation and verbosity.
         * @param options an optional parameter which controls the single-square
         * move generation and verbosity.
         * @returns The list of all valid moves, either in SAN format, or as
         * verbose objects.
         */
        public moves(options?: {
            /** Set to true to return verbose move objects instead of strings */
            verbose?: boolean;
            /**
             * The string to test if it is a valid move, if it is not then an
             * empty array is returned
             */
            square?: string;
        }): string[] | IMove[];

        /**
         * Returns true or false if the side to move is in check.
         * @returns true or false if the side to move is in check.
         */
        public in_check(): boolean;

        /**
         * Returns true or false if the side to move has been checkmated.
         * @returns true or false if the side to move has been checkmated.
         */
        public in_checkmate(): boolean;
        /**
         * Returns true or false if the side to move has been stalemated.
         * @returns true or false if the side to move has been stalemated.
         */
        public in_stalemate(): boolean;

        /**
         * Returns true or false if the game is drawn (50-move rule or insufficient material).
         * @returns true or false if the game is drawn (50-move rule or insufficient material).
         */
        public in_draw(): boolean;

        /**
         * Returns true if the game is drawn due to insufficient material
         * (K vs. K, K vs. KB, or K vs. KN); otherwise false.
         * @returns True if the game is drawn due to insufficient material
         * (K vs. K, K vs. KB, or K vs. KN); otherwise false.
         */
        public insufficient_material(): boolean;

        /**
         * Returns true or false if the current board position has occurred three or more times.
         * @returns true or false if the current board position has occurred three or more times.
         */
        public in_threefold_repetition(): boolean;

        /**
         * Returns true if the game has ended via checkmate, stalemate, draw,
         * threefold repetition, or insufficient material.
         * Otherwise, returns false.
         * @returns True if the game has ended via checkmate, stalemate, draw,
         * threefold repetition, or insufficient material. Otherwise, returns false.
         */
        public game_over(): boolean;

        /**
         * Returns a validation object specifying validity or the errors found within the FEN string.
         * @param fen the fen formatted string to validate
         */
        public validate_fen(fen: string): {
            /** Indicates if the fen is valid or not. */
            valid: boolean;

            /** If not valid, then this will a type of error used internally in chess.js. Otherwise 0 */
            error_number: number;

            /** The string "No errors." if valid. Otherwise a string explaining why it is not valid. */
            error: string;
        };

        /**
         * Returns the FEN string for the current position.
         * @returns the FEN string for the current position.
         */
        public fen(): string;

        /**
         * Returns the game in PGN format.
         * Options is an optional parameter which may include max width and/or a newline character settings.
         * @param options optional object which may include max width and/or a newline character settings.
         * @returns the current game state in PGN format.
         */
        public pgn(options?: {
            /** the maximum width of a line */
            max_width?: number,
            /** Specific newline character */
            newline_char?: "string";
        }): string;

        /**
         * Load the moves of a game stored in Portable Game Notation.
         * @param pgn the pgn should be a string in Portable Game Notation.
         * @param options An optional object which may contain a string newline_char and a boolean sloppy.
         * @returns The method will return true if the PGN was parsed successfully, otherwise false.
         */
        public load_pgn(pgn: string, options?: {
            /**
             * The newline_char is a string representation of a valid RegExp fragment and is used to process the PGN.
             * It defaults to \r?\n.
             * Special characters should not be pre-escaped, but any literal
             * special characters should be escaped as is normal for a RegExp.
             * Keep in mind that backslashes in JavaScript strings must themselves be escaped.
             * Avoid using a newline_char that may occur elsewhere in a PGN,
             * such as . or x, as this will result in unexpected behavior.
             */
            newline_char?: string;

            /**
             * The sloppy flag is a boolean that permits chess.js to parse moves in non-standard notations.
             * See .move documentation for more information about non-SAN notations.
             */
            sloppy?: boolean;
        }): boolean;

        /**
         * Allows header information to be added to PGN output.
         * Any number of key/value pairs can be passed to .header().
         * Calling .header() without any arguments returns the header information as an object.
         * @param args (optional) If any arguments are sent each two arguments are treated as a key/value pair
         * @returns Nothing if arguments are sent to store in the header.
         *          Otherwise returns the header information as an object.
         */
        public header(...args: string[]): void | {[key: string]: string};

        /**
         * Returns a string containing an ASCII diagram of the current position.
         * @returns A string containing an ASCII diagram of the current position.
         */
        public ascii(): string;

        /**
         * Returns the current side to move.
         * @returns "b" if Black is to move, otherwise "w" for White.
         */
        public turn(): "b" | "w";

        /**
         * Attempts to make a move on the board, returning a move object if the move was legal, otherwise null.
         * The .move function can be called two ways, by passing a string in Standard Algebraic Notation (SAN),
         * Or by passing .move() a move object (only the 'to', 'from', and when
         * necessary 'promotion', fields are needed).
         * @param move Must be either a string in Standard Algebraic Notation (SAN),
         *             or a move object (only the 'to', 'from', and when necessary 'promotion', fields are needed)
         * @param options An optional sloppy flag can be used to parse a variety of non-standard move notations:
         * @returns The move as a full object is returned if the move was valid, and the chess board's state changes.
         *          If the move was invalid, ull is returned and the state does not update.
         */
        public move(move: string | IShortMove, options: {
            /** An optional sloppy flag can be used to parse a variety of non-standard move notations */
            sloppy?: boolean;
        }): null | IMove;

        /**
         * Take back the last half-move, returning a move object if successful, otherwise null.
         * @returns the move object that was undone if successful, otherwise null.
         */
        public undo(): null | IMove;

        /**
         * Clears the board of all pieces.
         */
        public clear(): void;

        /**
         * Place a piece on the square where piece is an object with the form
         * { type: ..., color: ... }.
         * put() will fail when passed an invalid piece or square, or when two
         * or more kings of the same color are placed.
         * @param piece the piece to put somewhere on the game board
         * @returns true if the piece was successfully placed, otherwise, the
         * board remains unchanged and false is returned.
         */
        public put(piece: IPiece): boolean;

        /**
         * Returns the piece on the square
         * @param square the square to get the piece on.
         * @returns null if no piece is on that square, or it is not a valid square. Otherwise a piece object.
         */
        public get(square: string): null | IPiece;

        /**
         * Remove and return the piece on square.
         * @param square the square to remove the piece from, e.g. "b6"
         * @returns null if no piece was removed, otherwise an object with the removed piece's type and color.
         */
        public remove(square: string): null | IPiece;

        // appears to be a debugging utility
        // perft: [Function: perft],

        /**
         * Returns the color of the square ('light' or 'dark').
         * @param square the square to check if it is light or dark.
         * @returns "light" if a light square, "dark" if a dark square, or null if not a valid square.
         */
        public square_color(square: string): "light" | "dark" | null;

        /**
         * Returns a list containing the moves of the current game.
         * Options is an optional parameter which may contain a 'verbose' flag.
         * See .moves() for a description of the verbose move fields.
         * @param options an optional parameter which may contain a 'verbose' flag.
         * @returns a list of all moves of the current game. They will be strings if not passed the verbose flag.
         */
        public history(options: {
            /** Pass true if you want this function to output verbose objects instead of strings */
            verbose?: boolean;
        }): string[] | IMove[];
    }
}
