// Do not modify this file

require("./style.scss");

namespace = {
    Game: require("./game"),
    Pane: require("./pane"),
    textures: require("./textures/"),
    settings: require("./settings"),
};

namespace.Game.prototype.namespace = namespace;
namespace.Game.prototype._gameObjectClasses = {
% for game_obj_key in sort_dict_keys(game_objs):
    "${game_obj_key}": require("./${lowercase_first(game_obj_key)}"),
% endfor
};

module.exports = namespace;
