import * as Settings from "src/viseur/settings";
Settings.BaseSetting.newIndex = 0; // reset to zero for these new settings

export const GameSettings = {
    // <<-- Creer-Merge: settings -->>
    flipBoard: new Settings.CheckBoxSetting({
        id: "flip-board",
        label: "Flip Board",
        hint: "Flips the board so that Black is on the bottom",
        default: false,
    }),

    pawnPromotion: new Settings.DropDownSetting<string>({
        id: "pawn-promotion",
        label: "Pawn Promotion",
        hint: "Human Only: Sets the piece to which the pawn is promoted upon promotion",
        options: [ "Queen", "Knight", "Bishop", "Rook" ],
        default: "Queen",
    }),
    // <<-- /Creer-Merge: settings -->>
};
