// Do not modify this file

require("./style.scss");

namespace = {
    Game: require("./game"),
    Pane: require("./pane"),
    HumanPlayer: require("./humanPlayer"),
    textures: require("./textures/"),
    settings: require("./settings"),
};

namespace.Game.prototype.namespace = namespace;
namespace.Game.prototype._gameObjectClasses = {
    "Bottle": require("./bottle"),
    "Cowboy": require("./cowboy"),
    "Furnishing": require("./furnishing"),
    "GameObject": require("./gameObject"),
    "Player": require("./player"),
    "Tile": require("./tile"),
};

module.exports = namespace;
