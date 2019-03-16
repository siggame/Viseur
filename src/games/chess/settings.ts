import * as Settings from "src/viseur/settings";
Settings.BaseSetting.newIndex = 0; // reset to zero for these new settings

/** The settings for the Chess game. */
export const GameSettings = {
    // <<-- Creer-Merge: settings -->>

    /** Setting for flipping the board vertically. */
    flipBoard: new Settings.CheckBoxSetting({
        default: false,
        hint: "If the board should be flipped so that a rank files are on top",
        label: "Flip Board",
        id: "flip-board",
    }),

    /** Setting for human player pawn promotion type */
    pawnPromotion: new Settings.DropDownSetting<"q" | "n" | "r" | "b">({
        id: "pawn-promotion",
        label: "Pawn Promotion",
        hint: "When making moves as a human player, the type of piece to promote pawns to automatically",
        options: [
            { text: "Queen", value: "q" },
            { text: "Knight", value: "n" },
            { text: "Rook", value: "r" },
            { text: "Bishop", value: "b" },
        ],
        default: "q",
    }),

    // <<-- /Creer-Merge: settings -->>
};
