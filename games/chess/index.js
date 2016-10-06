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
    "GameObject": require("./gameObject"),
    "Move": require("./move"),
    "Piece": require("./piece"),
    "Player": require("./player"),
};

module.exports = namespace;
