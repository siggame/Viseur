require("./renderer.scss");

var $ = require("jquery");
var PIXI = require("pixi.js");
var Color = require("color");
var Classe = require("classe");
var BaseElement = require("core/ui/baseElement");
var Observable = require("core/observable");
var SettingsManager = require("viseur/settingsManager");
var ContextMenu = require("core/ui/contextMenu");

/**
 * @class Renderer - Singleton that hanles rendering (visualizing) the game
 */
var Renderer = Classe(Observable, BaseElement, {
    /**
     * Initializes the Renderer, should be called by Visuer
     *
     * @constructor
     * @param {Object} args - initialization args
     */
    init: function(args) {
        args = $.extend({}, args); // make a copy
        var self = this;

        Observable.init.call(this);
        BaseElement.init.apply(this, arguments);

        this._scene = new PIXI.Container();

        // the root of all game pixi elements in the game
        this.rootContainer = new PIXI.Container();
        this.rootContainer.setParent(this._scene);
        this._graphics = new PIXI.Graphics();
        this.rootContainer.addChild(this._graphics);

        // for by pixel value drawing, e.g. grid outline
        this._pxContainer = new PIXI.Container();
        this._pxContainer.setParent(this._scene);
        this._pxGraphics = new PIXI.Graphics();
        this._pxContainer.addChild(this._pxGraphics);

        // try to default the font to that of the default css rule
        this._defaultFontFamily = args.defaultFont || $("body").css("font-family").split(",")[0] || "Arial";

        this._pxExternalWidth = 800;
        this._pxExternalHeight = 600;
        // will be resized, just placeholder dimensions
        this._renderer = new PIXI.autoDetectRenderer(this._pxExternalWidth, this._pxExternalHeight, {
            antialias: SettingsManager.get("viseur", "anti-aliasing", true),
        });

        this._bounds = {};
        this.setSize(1, 1);

        // add the renderer view element to the DOM
        this.$element
            .append(this._renderer.view)
            .on("resize", function() {
                self._onParentResized(self.$element.width(), self.$element.height());
            })
            .on("contextmenu", function() {
                return false;
            });

        this.$pixiCanvas = this.$element.find("canvas");

        // when resolution settings change, resize
        SettingsManager.onChanged("viseur", "resolution-type", function() {
            self.resize();
        });
        SettingsManager.onChanged("viseur", "resolution-width", function() {
            self.resize();
        });
        SettingsManager.onChanged("viseur", "resolution-height", function() {
            self.resize();
        });

        SettingsManager.onChanged("viseur", "show-grid", function() {
            self._drawGrid();
        });

        this.contextMenu = new ContextMenu({
            $parent: this.$element,
        });

        /* eslint-disable require-jsdoc */
        function animate() {
            window.requestAnimationFrame(animate); // this is the animate function itself

            self._emit("rendering");

            self._renderer.render(self._scene);
        }
        /* eslint-enable require-jsdoc */

        window.requestAnimationFrame(animate);
    },

    _template: require("./renderer.hbs"),

    /**
     * loads textures into PIXI
     *
     * @param {Object} textures - key object pairs with the key being the id of the texture and the value being the texture's path
     * @param {function} callback - callback function to invoke once all functions are loaded
     */
    loadTextures: function(textures, callback) {
        var loader = PIXI.loader;

        textures[""] = "viseur/game/blank.png"; // all games have access to the blank (white) square

        var hasTextures = false;
        for(var key in textures) {
            if(textures.hasOwnProperty(key)) {
                hasTextures = true;
                if(textures.hasOwnProperty(key)) {
                    loader.add(key, textures[key]);
                }
            }
        }

        if(!hasTextures) {
            callback(false);
            return;
        }

        var self = this;
        loader.load(function(loader, resources) {
            self._resources = resources;
            if(callback) {
                callback();
            }
        });
    },

    /**
     * Sets the size of the Renderer, not in pixels but some abstract size. Basically the size of the map. So for example in chess it would be 8x8, and the actual size in pixels will be calculated by the Renderer, regardless of screen size
     *
     * @param {number} width - width of the renderer
     * @param {number} height - height of the renderer
     * @param {number} [leftOffset=0] - left x offset for the grid
     * @param {number} [topOffset=0] - top y offset for the grid
     * @param {number} [rightOffset=0] - right x offset for the grid
     * @param {number} [bottomOffset=0] - bottom y offset for the grid
     */
    setSize: function(width, height, leftOffset, topOffset, rightOffset, bottomOffset) {
        this._width = Math.abs(width || 1);
        this._height = Math.abs(height || 1);

        // used to draw the grid
        this._leftOffset = leftOffset || 0;
        this._topOffset = topOffset || 0;
        this._rightOffset = rightOffset || 0;
        this._bottomOffset = bottomOffset || 0;

        this.resize();

        // source: https://www.snip2code.com/Snippet/83438/A-base-implementation-of-properly-handli
    },

    /**
     * Resizes the render to fit its container, or resize to fit a new size
     *
     * @param {number} [pxExternalWidth] - the max width in px the renderer can fill, defaults to the last stored mxMaxWidth
     * @param {number} [pxExternalHeight] - the max height in px the renderer can fill, defaults to the last stored mxMaxHeight
     */
    resize: function(pxExternalWidth, pxExternalHeight) {
        if(arguments.length === 0) { // get saved resolution
            pxExternalWidth = this._pxExternalWidth;
            pxExternalHeight = this._pxExternalHeight;
        }
        else { // save this resolution
            this._pxExternalWidth = pxExternalWidth;
            this._pxExternalHeight = pxExternalHeight;
        }

        var manualResolution = Boolean(SettingsManager.get("viseur", "resolution-type") === "Manual");
        var pxInternalWidth = pxExternalWidth;
        var pxInternalHeight = pxExternalHeight;

        if(manualResolution) {
            pxInternalWidth = SettingsManager.get("viseur", "resolution-width", 800);
            pxInternalHeight = SettingsManager.get("viseur", "resolution-height", 600);
        }

        var scaleRatio = this._getScaleRatio(pxInternalWidth, pxInternalHeight);

        var pxWidth = this._width * scaleRatio;
        var pxHeight = this._height * scaleRatio;

        this._scaledX = pxWidth / this._width;
        this._scaledY = pxHeight / this._height;

        this.rootContainer.scale.set(this._scaledX, this._scaledY);

        if(pxWidth !== this._pxWidth || pxHeight !== this._pxHeight) {
            this._renderer.resize(pxWidth, pxHeight);
        }

        this._pxWidth = pxWidth;
        this._pxHeight = pxHeight;

        if(this.$pixiCanvas) {
            if(manualResolution) {
                scaleRatio = this._getScaleRatio(pxExternalWidth, pxExternalHeight);
                pxWidth = this._width * scaleRatio;
                pxHeight = this._height * scaleRatio;
                var ratio = parseInt(this.$pixiCanvas.attr("width")) / this._pxWidth;
                this.$pixiCanvas.css("width", (pxWidth * ratio) + "px");
            }
            else {
                this.$pixiCanvas.removeAttr("style");
            }
        }

        var pxX = (pxExternalWidth / 2) - (pxWidth / 2);
        var pxY = (pxExternalHeight / 2) - (pxHeight / 2);
        this.$element
            .css("left", pxX)
            .css("top", pxY);

        this._drawGrid();
    },

    /**
     * Gets the scale ratio based on availble width/height to draw in
     *
     * @param {number} width - availible pixels along x
     * @param {number} height - availible pixels along y
     * @returns {number} a number to scale the width and height both by to fill them according to our aspect ratio
     */
    _getScaleRatio: function(width, height) {
        // scale to fix via width
        var pxFatness = width / height;
        var ourFatness = this._width / this._height;

        // adjust scaling
        var scaleRatio = 1;
        if(ourFatness >= pxFatness) { // scale for a snug width
            scaleRatio = width / this._width;
        }
        else { // scale for a snug height
            scaleRatio = height / this._height;
        }

        return scaleRatio;
    },

    /**
     * Creates and initializes a sprite for a texture with given options
     *
     * @param {string} textureKey - the key for the texture to load on this sprite
     * @param {PIXI.Container} parentContainer - the parent container for the sprite
     * @param {number} [width=1] - the width of the sprite
     * @param {number} [height=1] - the height of the sprite
     * @returns {PIXI.Sprite} a sprite with the given texture key, added to the parentContainer
     */
    newSprite: function(textureKey, parentContainer, width, height) {
        width = Math.abs(Number(width) || 1);
        height = Math.abs(Number(height) || 1);

        var resource = this._resources[textureKey];

        if(!resource) {
            throw new Error("Cannot load resource '{}' for a new sprite.".format(textureKey));
        }

        var texture = resource.texture;
        var sprite = new PIXI.Sprite(texture);
        sprite.setParent(parentContainer);

        // now scale the sprite, as it defaults to the dimensions of it's texture's pixel size
        sprite.scale.set(width / texture.width, height / texture.height);

        return sprite;
    },

    /**
     * Creates a new Pixi.Text object in the Renderer. This will use DPI scaling based on screen resolution for crisp text
     *
     * @param {string} text - the text
     * @param {PIXI.Container} parent - the parent container for the new text
     * @param {Object} [options] - options to send to the PIXI.Text initialization
     * @returns {PIXI.Text} the newly created text
     */
    newPixiText: function(text, parent, options) {
        options = $.extend({
            fontFamily: this._defaultFontFamily,
            height: 1,
        }, options);


        options.pxSize = options.height * (screen.height/this._height); // the max height in pixels that this text should be drawn at

        if(options.bold) {
            options.bold = "bold ";
        }

        if(options.fill && options.fill.rgbaString) { // then it is an instance of the 'color' module
            options.fill = options.fill.rgbaString();
        }

        options.font = "{bold}{pxSize}px {fontFamily}".format(options);

        var pixiText = new PIXI.Text(text, options);

        pixiText.setParent(parent);

        pixiText.scale.x = options.height / options.pxSize;
        pixiText.scale.y = options.height / options.pxSize;

        return pixiText;
    },

    /**
     * shows a menu structure as a context menu at the given (x, y)
     *
     * @param {Object} menus - ContextMenu structure to show
     * @param {number} x - x position in pixels relative to top left of canvas
     * @param {number} y - y postiion in pixels relative to top left of canvas
     */
    showContextMenu: function(menus, x, y) {
        this.contextMenu.setStructure(menus);

        this.contextMenu.show(x, y);
    },

    /**
     * Draws a grid over the rootContainer if the setting is enabled
     */
    _drawGrid: function() {
        this._pxGraphics.clear();

        if(!SettingsManager.get("viseur", "show-grid")) {
            return;
        }

        this._pxGraphics.lineStyle(1, 0x000000, 0.5);

        var startX = this._leftOffset * this._scaledX;
        var startY = this._topOffset * this._scaledY;
        var endX = (this._width - this._rightOffset) * this._scaledX;
        var endY = (this._height - this._bottomOffset) * this._scaledY;

        // draw vertical lines
        for(var x = 0; x < this._width; x++) {
            var dx = x * this._scaledX + startX;
            this._pxGraphics.moveTo(dx, startY);
            this._pxGraphics.lineTo(dx, endY);
            this._pxGraphics.endFill();
        }

        // draw horizontal lines
        for(var y = 0; y < this._height; y++) {
            var dy = y * this._scaledY + startY;
            this._pxGraphics.moveTo(startX, dy);
            this._pxGraphics.lineTo(endX, dy);
            this._pxGraphics.endFill();
        }
    },
});

module.exports = Renderer;
