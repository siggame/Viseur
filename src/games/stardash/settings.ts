import * as Settings from "src/viseur/settings";
Settings.BaseSetting.newIndex = 0; // reset to zero for these new settings

/** The settings for the Stardash game. */
export const GameSettings = {
    // <<-- Creer-Merge: settings -->>
    // put settings here, look at previous games for examples
    displayHealthBars: new Settings.CheckBoxSetting({
        id: "display-health-bars",
        label: "Show Health",
        hint: "Should health bars be displayed above Units",
        default: true,
    }),
    // <<-- /Creer-Merge: settings -->>
};
