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

    // <<-- /Creer-Merge: settings -->>
};
