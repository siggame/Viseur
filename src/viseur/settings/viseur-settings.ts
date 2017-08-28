// Settings for Viseur
import * as Setting from "./setting";

export const ViseurSettings: Setting.BaseSetting[] = [
    new Setting.DropDownSetting<string>({
        id: "info-pane-side",
        label: "Docked Side",
        hint: "Which side this info pane will be snapped to.",
        options: [
            { text: "\u25B2 Top", value: "top" },
            { text: "\u25B6 Right", value: "right" },
            { text: "\u25BC Bottom", value: "bottom" },
            { text: "\u25C0 Left", value: "left" },
        ],
    }),
    new Setting.NumberSetting({
        id: "playback-speed",
        label: "Playback Speed",
        hint: "The time (in ms)  for each animation to be played. Smaller numbers mean faster playback.",
        min: 10,
        max: 999999,
        value: 1000,
    }),
    new Setting.DropDownSetting<string>({
        id: "playback-mode",
        label: "Playback Mode",
        hint: "The preferred playback mode.\nDeltas based means the actual sequence of events is shown, but playback "
            + "may take longer for turns with a large number of events\nTurns based means the sequence of events is "
            + "compressed so each GameObject does everything at the same time, which is not actually what happened. "
            + "Playback speed increases with this enabled",
        options: [
            { text: "Deltas", value: "deltas" },
            { text: "Turns", value: "turns" },
        ],
        value: "deltas",
    }),
    new Setting.NumberSetting({
        id: "resolution-scale",
        label: "Resolution Scale",
        hint: "Up or down samples the resolution.\nValues below 1 render at a lower internal resolution, and may "
            + "perform faster on older computers.\nValues above 1 may sharpen the image.\n1 is native resolution.",
        min: 0.01,
        max: 2,
        step: 0.01,
        value: 2,
    }),
    new Setting.CheckBoxSetting({
        id: "anti-aliasing",
        label: "Anti-Aliasing",
        hint: "Forces FXAA to be applied. Requires restart.",
        value: true,
    }),
    new Setting.CheckBoxSetting({
        id: "show-grid",
        label: "Show Grid",
        hint: "Displays a grid over the game.",
        value: false,
    }),
    new Setting.CheckBoxSetting({
        id: "show-logged-text",
        label: "Show Logs",
        hint: "Displays logged text above GameObjects",
        value: true,
    }),
    new Setting.CheckBoxSetting({
        id: "allow-player-set-colors",
        label: "Show Logged Colors",
        hint: "Allows Players in gamelogs to set their colors via log calls",
        value: true,
    }),
];
