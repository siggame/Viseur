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
        min: 10,
        max: 999999,
        default: 1000,
    },
    {
        id: "playback-mode",
        label: "Playback Mode",
        hint: "The preferred playback mode.\nDeltas based means the actual sequence of events is shown, but playback may take longer for turns with a large number of events\nTurns based means the sequence of events is compressed so each GameObject does everything at the same time, which is not actually what happened. Playback speed increases with this enabled",
        input: "DropDown",
        options: [
            { text:"Deltas", value: "deltas" },
            { text: "Turns", value: "turns" },
        ],
        default: "deltas",
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
    {
        id: "show-logged-text",
        label: "Show Logs",
        hint: "Displays logged text above GameObjects",
        input: "CheckBox",
        default: true,
    },
    {
        id: "allow-playerset-colors",
        label: "Show Logged Colors",
        hint: "Allows Players in gamelogs to set their colors via log calls",
        input: "CheckBox",
        default: true,
    },
];
