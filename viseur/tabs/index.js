// these are all the tabs for the InfoPane, in order
module.exports = [
    {
        title: "File",
        classe: require("./fileTab"),
    },
    { // TODO: re-enable once performance has been fixed
        title: "Inspect",
        classe: require("./inspectTab"),
    },
    {
        title: "Settings",
        classe: require("./settingsTab"),
    },
    {
        title: "Help",
        classe: require("./helpTab"),
    },
];
