import * as Settings from "src/viseur/settings";

export const GameSettings = {
    // <<-- Creer-Merge: settings -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.

    flipBoard: new Settings.CheckBoxSetting({
        id: "flip-board",
        label: "Flip Board",
        hint: "Flips the board so that Black is on the bottom",
        default: false,
    }),

    pawnPromotion: new Settings.DropDownSetting({
        id: "pawn-promotion",
        label: "Pawn Promotion",
        hint: "Human Only: Sets the piece to which the pawn is promoted upon promotion",
        options: [ "Queen", "Knight", "Bishop", "Rook" ],
        default: "Queen",
    }),

    // <<-- /Creer-Merge: settings -->>
};
