var PIXI = require("pixi.js");

PIXI.utils._saidHello = true; // hack to disable the console.log(pixi banner) thing

// because they attach to the window by default which is bad practice just throwing "globals" out there
PIXI.requestAnimationFrame = function() {
    return window.requestAnimationFrame.apply(window, arguments);
};
