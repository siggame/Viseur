// Do not modify this file

require("./style.scss");

var namespace = {
    Game: require("./game"),
    Pane: require("./pane"),
    HumanPlayer: require("./humanPlayer"),
    textures: require("./textures/"),
    settings: require("./settings"),
};

namespace.Game.prototype.namespace = namespace;
namespace.Game.prototype._gameObjectClasses = {
    "BroodMother": require("./broodMother"),
    "Cutter": require("./cutter"),
    "GameObject": require("./gameObject"),
    "Nest": require("./nest"),
    "Player": require("./player"),
    "Spider": require("./spider"),
    "Spiderling": require("./spiderling"),
    "Spitter": require("./spitter"),
    "Weaver": require("./weaver"),
    "Web": require("./web"),
};

module.exports = namespace;
