// Settings for Viseur

var SettingsManager = require("./settingsManager");

module.exports = [
    {
        id: "info-pane-side",
        label: "Docked Side",
        hint: "Which side this info pane will be snapped to.",
        input: "DropDown",
        options: [
            { text:"\u25B2 Top", value: "top" },
            { text: "\u25B6 Right", value: "right" },
            { text: "\u25BC Bottom", value: "bottom" },
            { text: "\u25C0 Left", value: "left" },
        ],
        default: "right",
    },
    {
        id: "playback-speed",
        label: "Playback Speed",
        hint: "The time (in ms)  for each animation to be played. Smaller numbers mean faster playback.",
        input: "Number",
        min: 50,
        max: 999999,
        default: 1000,
    },
    {
        id: "resolution-scale",
        label: "Resolution Scale",
        hint: "Up or down samples the resolution.\nValues below 1 render at a lower internal resolution, and may perform faster on older computers.\nValues above 1 may sharpen the image.\n1 is native resolution.",
        input: "Number",
        min: 0.01,
        max: 2,
        step: 0.01,
        default: 1,
    },
    {
        id: "anti-aliasing",
        label: "Anti-Aliasing",
        hint: "Forces FXAA to be applied. Requires restart.",
        input: "CheckBox",
        default: true,
    },
    {
        id: "show-grid",
        label: "Show Grid",
        hint: "Displays a grid over the game.",
        input: "CheckBox",
        default: false,
    },
];
