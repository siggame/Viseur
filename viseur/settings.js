var SettingsManager = require("./settingsManager");

var onResolutionChanged = function(input) {
    SettingsManager.on("viseur.resolution-type.changed", function(newValue) {
        input.field.$element.toggleClass("collapsed", newValue !== "Manual");
    });

    input.field.$element.addClass("collapsed");
};

module.exports = [
    {
        id: "info-pane-side",
        label: "Docked Side",
        hint: "Which side this info pane will be snapped to",
        input: "DropDown",
        options: [ "Top", "Left", "Bottom", "Right" ],
    },
    {
        id: "resolution-type",
        label: "Resolution",
        hint: "'Auto' will resize to the current window's resolution.\n'Manual' can be used to set to a lower resolution for slower computers.",
        input: "DropDown",
        options: [ "Auto", "Manual" ],
    },
    {
        id: "resolution-width",
        label: "Width",
        input: "Number",
        min: 300,
        value: 800,
        max: screen.width,
        onInputCreated: onResolutionChanged,
    },
    {
        id: "resolution-height",
        label: "Height",
        input: "Number",
        min: 300,
        value: 400,
        max: screen.height,
        onInputCreated: onResolutionChanged,
    },
    {
        id: "anti-aliasing",
        label: "Anti-Aliasing",
        hint: "Only works in Google Chrome",
        input: "CheckBox",
    },
];
