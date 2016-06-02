require("./gui.scss");
require("./loadingMessage.scss");

var $ = require("jquery");
var Classe = require("classe");
var InfoPane = require("./infoPane");
var partial = require("core/partial");
var PlaybackPane = require("./playbackPane");
var Modal = require("core/ui/modal");
var BaseElement = require("core/ui/baseElement");
var Observable = require("core/observable");
var Viseur = require("./");
var KeyObserver = require("./keyObserver");

/**
 * @class GUI - all the GUI (DOM) elements in the Viseur
 */
var GUI = Classe(Observable, BaseElement, {
    init: function(args) {
        args.id = "GUI";
        Observable.init.apply(this);
        BaseElement.init.apply(this, arguments);

        this.infoPane = new InfoPane({
            $parent: this.$element,
            gui: this,
        });

        this.$gameplayWrapper = this.$element.find(".gameplay-wrapper");

        this.$playbackWrapper = this.$element.find(".playback-pane-wrapper");
        this.playbackPane = new PlaybackPane({
            $parent: this.$playbackWrapper,
        });

        this.playbackPane.on("fullscreen-enabled", function() {
            self.goFullscreen();
        });

        this.$rendererWrapper = this.$element.find(".renderer-wrapper");
        this.$visualizerWrapper = this.$element.find(".visualizer-pane-wrapper");

        this.proxy(this.playbackPane);

        this.modal = new Modal({
            id: "main-modal",
            $parent: this.$element.parent(),
        });

        var self = this;
        Viseur.on("gamelog-loaded", function(gamelog) {
            self.$element.addClass("gamelog-loaded");
        });

        this.infoPane.on("resized", function(width, height) {
            self._resizeVisualizer(width, height);
        });

        this.infoPane.on("resize-start", function() {
            self.$element.addClass("resizing");
        });

        this.infoPane.on("resize-end", function() {
            self.$element.removeClass("resizing");
        });

        window.addEventListener("resize", function() {
            self.resize();
        });
    },

    _template: require("./gui.hbs"),
    _loadingPartial: partial(require("./loadingMessage.hbs")),

    resize: function() {
        this.infoPane.resize();
    },

    _resizeVisualizer: function(width, height) {
        var newWidth = this.$element.width();
        var newHeight = this.$element.height();
        var newTop = 0;
        var newLeft = 0;

        if(this.infoPane.orientation === "horizontal") {
            newHeight -= height;

            if(this.infoPane.side === "top") {
                newTop = height;
            }
        }
        else {
            newWidth -= width;

            if(this.infoPane.side === "left") {
                newLeft = width;
            }
        }

        this.$visualizerWrapper
            .css("width", newWidth)
            .css("height", newHeight)
            .css("top", newTop)
            .css("left", newLeft);

        var remainingHeight = newHeight - this.$gameplayWrapper.height() - this.$playbackWrapper.height();
        this.$rendererWrapper
            .width(newWidth)
            .height(remainingHeight);

        this._emit("resized", newWidth, newHeight, remainingHeight);
    },

    modalMessage: function(message) {
        this.modal.show(this._loadingPartial({
            message: message
        }));
    },

    modalError: function(message) {
        this.modal.show(this._loadingPartial({
            message: message,
        }).addClass("error"));
    },

    hideModal: function() {
        this.modal.hide();
    },

    goFullscreen: function() {
        this.$element
            .addClass("fullscreen")
            .goFullscreen();

        this._isFullscreen = true;

        this._resizeVisualizer(0, 0);

        var self = this;
        KeyObserver.once("escape.up", function() {
            self.exitFullscreen();
        });
    },

    exitFullscreen: function() {
        this.$element.removeClass("fullscreen");

        $.exitFullscreen();

        var self = this;

        setTimeout(function() { // HACK: width and height will be incorrect after going out of fullscreen, so wait a moment
            self.resize();
        }, 0);

        this._isFullscreen = false;
    },

    isFullscreen: function() {
        return this._isFullscreen;
    }
});

module.exports = GUI;
