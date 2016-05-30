var Classe = require("classe");
var BaseGameObject = require("viseur/game/baseGameObject");

var GameObject = Classe(BaseGameObject, {
    renderOrder: -1,
});

module.exports = GameObject;
