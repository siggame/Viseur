import * as Settings from "src/viseur/settings";
Settings.BaseSetting.newIndex = 0; // reset to zero for these new settings

/** The settings for the Saloon game. */
export const GameSettings = {
    // <<-- Creer-Merge: settings -->>

    sharpshooterFocus: new Settings.SliderSetting({
        id: "sharpshooter-focus",
        label: "Focus Intensity",
        hint: "How intense the Sharpshooter focus color should be.",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.33,
    }),

    showHealthBars: new Settings.CheckBoxSetting({
        id: "display-health-bars",
        label: "Show Health Bars",
        hint: "Should health bars be displayed above Cowboys and Furnishings",
        default: true,
    }),

    // <<-- /Creer-Merge: settings -->>
};
