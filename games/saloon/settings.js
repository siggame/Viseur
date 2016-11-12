module.exports = [
    //<<-- Creer-Merge: settings -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    {
        id: "sharpshooter-focus",
        label: "Focus Intensity",
        hint: "How intense the Sharpshooter focus color should be.",
        input: "Slider",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.33,
    },
    {
        id: "display-health-bars",
        label: "Show Health",
        hint: "Should health bars be displayed above Cowboys and Furnishings",
        input: "CheckBox",
        default: true,
    },

    //<<-- /Creer-Merge: settings -->>
];
