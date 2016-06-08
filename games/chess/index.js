require("./style.scss");

namespace = {
    Game: require("./game"),
    Pane: require("./pane"),
    textures: require("./textures/"),
    settings: require("./settings"),
};

namespace.Game.prototype.namespace = namespace;
namespace.Game.prototype._gameObjectClasses = {
    "GameObject": require("./gameObject"),
    "Move": require("./move"),
    "Player": require("./player"),
    "Piece": require("./piece"),
};

module.exports = namespace;
