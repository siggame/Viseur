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
    "Beaver": require("./beaver"),
    "GameObject": require("./gameObject"),
    "Job": require("./job"),
    "Player": require("./player"),
    "Spawner": require("./spawner"),
    "Tile": require("./tile"),
};

module.exports = namespace;
