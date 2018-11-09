import * as Settings from "src/viseur/settings";
Settings.BaseSetting.newIndex = 0; // reset to zero for these new settings

/** The settings for the Checkers game. */
export const GameSettings = {
    // <<-- Creer-Merge: settings -->>

    kingedAlpha: new Settings.SliderSetting({
        id: "kinged-alpha",
        label: "Kinged Transparency",
        hint: "The alpha value for kinged icon transparency",
        default: 0.9,
        min: 0,
        max: 1,
    }),

    // <<-- /Creer-Merge: settings -->>
};
