require("./renderer.scss");

var $ = require("jquery");
var PIXI = require("pixi.js");
var Color = require("color");
var Classe = require("classe");
var BaseElement = require("core/ui/baseElement");
var Observable = require("core/observable");
var SettingsManager = require("viseur/settingsManager");

/**
 * @class Renderer - Singleton that hanles rendering (visualizing) the game
 */
var Renderer = Classe(Observable, BaseElement, {
    init: function(args) {
        args = $.extend({
        }, args);

        Observable.init.call(this);
        BaseElement.init.apply(this, arguments);

        this.rootContainer = new PIXI.Container();

        this._defaultFontFamily = args.defaultFont || $("body").css("font-family").split(",")[0] || "Arial";
        this._pxMaxWidth = 800;
        this._pxMaxHeight = 600;
        this._renderer = new PIXI.autoDetectRenderer(this._pxMaxWidth, this._pxMaxHeight, {
            antialias: SettingsManager.get("viseur", "anti-aliasing", true),
        }); // will be resized, just placeholder dimensions

        this._bounds = {};
        this.setSize(1, 1);

        var self = this;

        this._graphics = new PIXI.Graphics();
        this.rootContainer.addChild(this._graphics);

        // add the renderer view element to the DOM
        this.$element
            .append(this._renderer.view)
            .on("resize", function() {
                self._onParentResized(self.$element.width(), self.$element.height());
            });

        window.requestAnimationFrame(animate);
        function animate() {
            window.requestAnimationFrame(animate);

            self._emit("rendering");

            self._renderer.render(self.rootContainer);
        }
    },

    _template: require("./renderer.hbs"),

    /**
     * loads textures into PIXI
     *
     * @param {Object} key object pairs with the key being the id of the texture and the value being the texture's path
     * @param {function} callback - callback function to invoke once all functions are loaded
     */
    loadTextures: function(textures, callback) {
        var loader = PIXI.loader;

        for(var key in textures) {
            if(textures.hasOwnProperty(key)) {
                loader.add(key, textures[key]);
            }
        }

        var self = this;
        loader.load(function (loader, resources) {
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
     */
    setSize: function(width, height) {
        this._width = Math.abs(width || 1);
        this._height = Math.abs(height || 1);

        this.resize();

        //https://www.snip2code.com/Snippet/83438/A-base-implementation-of-properly-handli
    },

    /**
     * Resizes the render to fit its container, or resize to fit a new size
     *
     * @param {number} [mxMaxWidth] - the max width in px the renderer can fill, defaults to the last stored mxMaxWidth
     * @param {number} [mxMaxHeight] - the max height in px the renderer can fill, defaults to the last stored mxMaxHeight
     */
    resize: function(pxMaxWidth, pxMaxHeight) {
        if(arguments.length === 0) {
            pxMaxWidth = this._pxMaxWidth;
            pxMaxHeight = this._pxMaxHeight;
        }
        else {
            this._pxMaxWidth = pxMaxWidth;
            this._pxMaxHeight = pxMaxHeight;
        }

        // scale to fix via width
        var pxFatness = pxMaxWidth / pxMaxHeight;
        var ourFatness = this._width / this._height;

        // adjust scaling
        var scaleRatio = 1;
        if(ourFatness >= pxFatness) { // scale for a snug width
            scaleRatio = pxMaxWidth / this._width;
        }
        else { // scale for a snug height
            scaleRatio = pxMaxHeight / this._height;
        }

        var pxWidth = this._width * scaleRatio;
        var pxHeight = this._height * scaleRatio;
        var pxX = (pxMaxWidth / 2) - (pxWidth / 2);
        var pxY = (pxMaxHeight / 2) - (pxHeight / 2);

        if(pxWidth !== this._pxWidth || pxHeight !== this._pxHeight) {
            this._renderer.resize(pxWidth, pxHeight);
        }
        this.$element
            .css("left", pxX)
            .css("top", pxY);

        this._pxWidth = pxWidth;
        this._pxHeight = pxHeight;
        this._scaledX = pxWidth / this._width;
        this._scaledY = pxHeight / this._height;

        this.rootContainer.scale.set(this._scaledX, this._scaledY);
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
        //*
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
});

module.exports = Renderer;
