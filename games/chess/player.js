var Classe = require("classe");
var BaseGameObject = require("viseur/game/baseGameObject");

var GameObject = Classe(BaseGameObject, {
    render: false,
});

module.exports = GameObject;
