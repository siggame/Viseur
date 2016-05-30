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
        });

        this.$gameplayWrapper = this.$element.find(".gameplay-wrapper");

        this.$playbackWrapper = this.$element.find(".playback-pane-wrapper");
        this.playbackPane = new PlaybackPane({
            $parent: this.$playbackWrapper,
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
                top = height;
            }
        }
        else {
            newWidth -= width;

            if(this.infoPane.side === "left") {
                left = width;
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
});

module.exports = GUI;
