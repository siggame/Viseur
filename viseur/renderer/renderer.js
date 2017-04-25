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

        // check only now for anti-aliasing, because them changing it requires a restart to see it inverted
        var aa = SettingsManager.get("viseur", "anti-aliasing", true);

        // will be resized, just placeholder dimensions
        this._renderer = new PIXI.autoDetectRenderer(this._pxExternalWidth, this._pxExternalHeight, {
            antialias: aa,
            forceFXAA: aa,
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
        SettingsManager.onChanged("viseur", "resolution-scale", function() {
            self.resize();
        });

        SettingsManager.onChanged("viseur", "show-grid", function() {
            self._drawGrid();
        });

        this.contextMenu = new ContextMenu({
            $parent: this.$element,
        });

        this._ticker = new PIXI.ticker.Ticker();
        this._ticker.stop();
        this._ticker.add(function() {
            self.render();
        });

        this._ticker.start();
    },

    _template: require("./renderer.hbs"),

    render: function() {
        // tell everything that is observing us that they need to update their PIXI objects
        this._emit("rendering");
        // and now have PIXI render it
        this._renderer.render(this._scene);
    },

    /**
     * loads textures into PIXI
     *
     * @param {Object} textures - key object pairs with the key being the id of the texture and the value being the texture's path
     * @param {function} callback - callback function to invoke once all functions are loaded
     */
    loadTextures: function(textures, callback) {
        var loader = PIXI.loader;

        this._sheets = {};
        this._spriteData = {};
        this._textures = {};

        textures[""] = { // all games have access to the blank (white) square
            key: "",
            path: "viseur/game/blank.png",
        };

        var hasTextures = false;
        for(var key in textures) {
            if(textures.hasOwnProperty(key)) {
                hasTextures = true;
                var val = textures[key];

                // it is a sprite sheet, so extract the path and build frames after loaded
                loader.add(key, val.path);
                this._spriteData[key] = val;

                // then this is a sheet of frames we need to generate
                if(val.sheet) {
                    this._sheets[key] = val.sheet;
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

            // now build frames for the sprite sheets
            for(var key in self._sheets) {
                if(self._sheets.hasOwnProperty(key)) {
                    var sheet = self._sheets[key];
                    var texture = resources[key].texture;

                    var width = texture.width/sheet.width;
                    var height = texture.height/sheet.height;

                    // assume x first for the major axis, but they can manually override with the axis: "y" sheet setting
                    var yFirst = sheet.axis === "y" || sheet.axis === "Y";
                    var size = sheet.width * sheet.height;

                    // build a separate texture for each part of the sprite sheet
                    for(var i = 0; i < size; i++) {
                        var x = 0;
                        var y = 0;

                        if(yFirst) {
                            x = Math.floor(i/sheet.height);
                            y = i%sheet.height;
                        }
                        else {
                            x = i%sheet.width;
                            y = Math.floor(i/sheet.width);
                        }

                        self._textures[key + "@" + i] = new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(x*width, y*height, width, height));
                    }
                }
            }

            if(callback) {
                callback();
            }
        });
    },

    /**
     * Gets the texture for a given key
     *
     * @param  {string} key - the key of the texture
     * @return {PIXI.Texture} the texture for that key
     */
    getTexture: function(key) {
        var resource = this._resources[key];
        if(resource) {
            return resource.texture;
        }

        var texture = this._textures[key];
        if(texture) {
            return texture;
        }
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

        var resolutionScale = SettingsManager.get("viseur", "resolution-scale");
        var pxInternalWidth = Math.clamp(pxExternalWidth * resolutionScale, 1, 4096); // clamp between 1 to 4096 pixels, with 4096 being the smallest max a browser can do without screwing up our scaling math
        var pxInternalHeight = Math.clamp(pxExternalHeight * resolutionScale, 1, 4096); // Note: (yes 1x1 would be stupid to render)

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
            if(pxExternalWidth !== pxInternalWidth && pxExternalHeight !== pxInternalHeight) { // have css scale it
                scaleRatio = this._getScaleRatio(pxExternalWidth, pxExternalHeight);
                pxWidth = this._width * scaleRatio;
                pxHeight = this._height * scaleRatio;
                var ratio = parseInt(this.$pixiCanvas.attr("width")) / this._pxWidth;
                this.$pixiCanvas.css("width", (pxWidth * ratio) + "px");
            }
            else { // pixel perfect fit
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
     * Gets the scale ratio based on available width/height to draw in
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
        var texture = this.getTexture(textureKey);
        if(!texture) {
            throw new Error("Cannot load texture '{}' for a new sprite.".format(textureKey));
        }

        // texture = new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(0, 0, texture.width/2, texture.height/2));
        var sprite = new PIXI.Sprite(texture);
        sprite.setParent(parentContainer);
        var spriteDataKey = textureKey.split("@")[0]; // in case they are indexing a sprite sheet, we just need the first part before the '@' for the spriteData
        var spriteData = this._spriteData[spriteDataKey] || {};

        if(!width || width < 0) {
            width = spriteData.width || 1;
        }

        if(!height || height < 0) {
            height = spriteData.height || 1;
        }

        // now scale the sprite, as it defaults to the dimensions of it's texture's pixel size
        sprite.unscale = function() {
            sprite.scale.set(width / texture.width, height / texture.height);
        };
        sprite.unscale();

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

        var height = options.height;
        delete options.height;

        var pxSize = (height * (screen.height/this._height));
        options.fontSize = pxSize + "px"; // the max height in pixels that this text should be drawn at

        if(options.bold) {
            options.fontWeight = "bold";
            delete options.bold;
        }

        if(options.fill && options.fill.rgbaString) { // then it is an instance of the 'color' module
            options.fill = options.fill.rgbaString();
        }

        var pixiText = new PIXI.Text(text, options);

        pixiText.setParent(parent);

        pixiText.scale.x = height/pxSize;
        pixiText.scale.y = height/pxSize;

        return pixiText;
    },

    /**
     * shows a menu structure as a context menu at the given (x, y)
     *
     * @param {Object} menus - ContextMenu structure to show
     * @param {number} x - x position in pixels relative to top left of canvas
     * @param {number} y - y position in pixels relative to top left of canvas
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

    /**
     * Takes a sprite a "stretches" it between two points along it's width, useful for beam type effects
     *
     * @param {PIXI.Sprite} sprite - the sprite to use. Assumed to be 1x1 units by default. It's width and pivot will be scaled for the stretching
     * @param {Object} pointA - the first point, an object with an {x, y} to derive coordinates from
     * @param {Object} pointB - the second point, an object with an {x, y} to derive coordinates from
     */
    renderSpriteBetween: function(sprite, pointA, pointB) {
        var distance = Math.euclideanDistance(pointA, pointB);
        sprite.width = distance;
        sprite.setRelativePivot(0.5, 0.5);

        var angleRadians = Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x);
        sprite.rotation = angleRadians;

        var midX = (pointA.x + pointB.x)/2;
        var midY = (pointA.y + pointB.y)/2;
        sprite.position.set(midX + 0.5, midY + 0.5);
    },
});

module.exports = Renderer;
