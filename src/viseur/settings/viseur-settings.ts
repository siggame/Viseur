// Settings for Viseur
import * as Setting from "./setting";
import { createSettings } from "./settings";

/**
 * The settings for the core Viseur instance.
 */
export const ViseurSettings = createSettings("viseur", {
    infoPaneSide: new Setting.DropDownSetting<
        "top" | "right" | "bottom" | "left"
    >({
        id: "info-pane-side",
        label: "Docked Side",
        hint: "Which side this info pane will be snapped to.",
        options: [
            { text: "\u25B2 Top", value: "top" },
            { text: "\u25B6 Right", value: "right" },
            { text: "\u25BC Bottom", value: "bottom" },
            { text: "\u25C0 Left", value: "left" },
        ],
        default: "right",
    }),
    infoPaneLength: new Setting.NumberSetting({
        id: "info-pane-length",
        label: "Info Pane Length",
        hint: "The length (in pixels) of this info pane",
        min: 200,
        default: 440,
    }),
    theme: new Setting.DropDownSetting<"Light" | "Dark">({
        id: "gui-theme",
        label: "Theme",
        hint: "The color scheme to use for the GUI",
        options: ["Light", "Dark"],
        default: "Light",
    }),
    playbackSpeed: new Setting.NumberSetting({
        id: "playback-speed",
        label: "Playback Speed",
        hint:
            "The time (in ms)  for each animation to be played. Smaller numbers mean faster playback.",
        min: 10,
        max: 1000,
        default: 200,
    }),
    playbackMode: new Setting.DropDownSetting<"deltas" | "turns">({
        id: "playback-mode",
        label: "Playback Mode",
        hint: `The preferred playback mode.
Deltas based means the actual sequence of events is shown, however playback may take longer for turns with a large number of events.
Turns based means the sequence of events is compressed so each GameObject does everything at the same time, which is not actually what happened.
Playback speed is generally increased in Turns mode.`,
        options: [
            { text: "Deltas", value: "deltas" },
            { text: "Turns", value: "turns" },
        ],
        default: "deltas",
    }),
    resolutionScale: new Setting.NumberSetting({
        id: "resolution-scale",
        label: "Resolution Scale",
        hint: `Up or down samples the resolution.
Values below 1 render at a lower internal resolution, and may perform faster on older computers.
Values above 1 may sharpen the image.
Value of 1 is native resolution.`,
        min: 0.01,
        max: 2,
        step: 0.01,
        default: 2,
    }),
    antiAliasing: new Setting.CheckBoxSetting({
        id: "anti-aliasing",
        label: "Anti-Aliasing",
        hint: "Forces FXAA to be applied. Requires restart.",
        default: true,
    }),
    showGrid: new Setting.CheckBoxSetting({
        id: "show-grid",
        label: "Show Grid",
        hint: "Displays a grid over the game.",
        default: false,
    }),
    showLoggedText: new Setting.CheckBoxSetting({
        id: "show-logged-text",
        label: "Show Logs",
        hint: "Displays logged text above GameObjects.",
        default: true,
    }),
    allowPlayerSetColors: new Setting.CheckBoxSetting({
        id: "allow-player-set-colors",
        label: "Show Logged Colors",
        hint: "Allows Players in gamelogs to set their colors via log calls.",
        default: true,
    }),
    printIO: new Setting.CheckBoxSetting({
        id: "print-io",
        label: "Print I/O to Console",
        hint:
            "Print the input/output from the game server to the browser's console.",
        default: false,
    }),
});
