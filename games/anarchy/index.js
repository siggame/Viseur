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
    "Building": require("./building"),
    "FireDepartment": require("./fireDepartment"),
    "Forecast": require("./forecast"),
    "GameObject": require("./gameObject"),
    "Player": require("./player"),
    "PoliceDepartment": require("./policeDepartment"),
    "Warehouse": require("./warehouse"),
    "WeatherStation": require("./weatherStation"),
};

module.exports = namespace;
