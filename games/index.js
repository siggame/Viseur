var games = {};
var req = require.context("./", true, /^(.*(index.js$))[^.]*$/igm);

// used to get game name out of
var front = "./";
var end = "/index.js";

req.keys().forEach(function(key) {
    var namespace = req(key);
    if(namespace.Game) {
        var dir = key.substr("./".length);
        dir = dir.substr(0, dir.length - "/index.js".length);

        namespace.dir = dir;

        games[namespace.Game.prototype.name] = namespace;
    }
});

module.exports = games;
