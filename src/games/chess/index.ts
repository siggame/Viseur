// Do not modify this file

require("./style.scss");
import { extname, basename } from "path";

const req = require.context("./textures/", true, /\.png$|\.jpg$|\.json/);

var namespace = {
    Game: require("./game"),
    Pane: require("./pane"),
    HumanPlayer: require("./humanPlayer"),
    textures: req.keys().reduce((obj, key) => {
        const extension = extname(key);
        const base = basename(key, extension);
        let properties;
        if (extension === ".json") {
            // it's metadata about the image
            properties = req(key);
        }
        else {
            // it's the raw image
            properties = { path: req(key) };
        }

        obj[base] = Object.assign(obj[base] || {}, properties);
        obj[base].key = base;
        return obj;
    }, {}),
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
