require("./renderer.scss");

var $ = require("jquery");
var PIXI = require("pixi.js");
var Color = require("color");
var Classe = require("classe");
var BaseElement = require("core/ui/baseElement");
var Observable = require("core/observable");
var SettingsManager = require("viseur/settingsManager");

var Renderer = Classe(Observable, BaseElement, {
    init: function(args) {
        args = $.extend({
        }, args);

        Observable.init.call(this);
        BaseElement.init.apply(this, arguments);

        this.rootContainer = new PIXI.Container();

        this._pxMaxWidth = 800;
        this._pxMaxHeight = 600;
        this._renderer = new PIXI.autoDetectRenderer(this._pxMaxWidth, this._pxMaxHeight, {
            antialias: SettingsManager.get("antialias", true),
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

        PIXI.requestAnimationFrame(animate);
        function animate() {
            PIXI.requestAnimationFrame( animate );

            self._emit("rendering");

            self._renderer.render(self.rootContainer);
        }
    },

    _template: require("./renderer.hbs"),

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

    setSize: function(width, height) {
        this._width = Math.abs(width || 1);
        this._height = Math.abs(height || 1);

        this.resize();

        //https://www.snip2code.com/Snippet/83438/A-base-implementation-of-properly-handli
    },

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

    _defaultFontFamily: $("body").css("font-family").split(",")[0] || "Arial",
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
