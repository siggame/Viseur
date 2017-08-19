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
    "Checker": require("./checker"),
    "GameObject": require("./gameObject"),
    "Player": require("./player"),
};

module.exports = namespace;
