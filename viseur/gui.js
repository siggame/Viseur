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
var dateFormat = require("dateformat");

/**
 * @class GUI - all the GUI (DOM) elements in the Viseur
 */
var GUI = Classe(Observable, BaseElement, {
    init: function(args) {
        var self = this;
        args.id = "GUI";
        Observable.init.apply(this);
        BaseElement.init.apply(this, arguments);

        this.infoPane = new InfoPane({
            $parent: this.$element,
            gui: this,
        });

        this.$gamePaneWrapper = this.$element.find(".game-pane-wrapper");

        this.$playbackWrapper = this.$element.find(".playback-pane-wrapper");
        this.playbackPane = new PlaybackPane({
            $parent: this.$playbackWrapper,
        });

        this.playbackPane.on("fullscreen-enabled", function() {
            self.goFullscreen();
        });

        this.$rendererWrapper = this.$element.find(".renderer-wrapper");
        this.$visualizerWrapper = this.$element.find(".visualizer-wrapper");
        this.$visualizerPaneWrapper = this.$element.find(".visualizer-pane-wrapper");

        this.proxy(this.playbackPane);

        this.modal = new Modal({
            id: "main-modal",
            $parent: this.$element.parent(),
        });

        Viseur.on("ready", function(game, gamelog) {
            self.$element.addClass("gamelog-loaded");
            document.title = "{gamelog.gameName} - {gamelog.gameSession} - {date} | Viseur".format({
                gamelog: gamelog,
                date: dateFormat(new Date(gamelog.epoch), "mmmm dS, yyyy, h:MM:ss:l TT Z"),
            });
            setTimeout(function() { // HACK: resize after all transitions finish, because we can't know for sure when the browser will finish css transitions in what order
                self.resize();
            }, 350); // after all transitions end
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

    /**
     * Resizes the GUI, invoked when the window is resized
     */
    resize: function() {
        this.infoPane.resize();
    },

    /**
     * Resizes the visualization's wrapper
     *
     * @private
     * @param {number} width - width taken away from the info pane
     * @param {number} height - height taken away from the info pane
     */
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

        this.$visualizerPaneWrapper
            .css("width", newWidth)
            .css("height", newHeight)
            .css("top", newTop)
            .css("left", newLeft);

        var playbackHeight = (parseInt(this.$playbackWrapper.css("height")) || 0);
        var remainingHeight = newHeight - playbackHeight;
        var remainingWidth = newWidth;

        this.$visualizerWrapper
            .width(remainingWidth)
            .height(remainingHeight);

        var gamePaneHeight = 0;

        if(Viseur.game && Viseur.game.pane) {
            gamePaneHeight = Viseur.game.pane.$element.outerHeight();
        }

        remainingHeight -= gamePaneHeight;

        this.$rendererWrapper
            .width(remainingWidth)
            .height(remainingHeight);

        this._emit("resized", newWidth, newHeight, remainingHeight);
    },



    // Modal stuff

    /**
     * Displays a message in the modal
     *
     * @param {string} message to display
     * @param {function} [callback] - callback to invoke upon showing async
     */
    modalMessage: function(message, callback) {
        this.modal.show(this._loadingPartial({
            message: message,
        }), callback);
    },

    /**
     * Displays a message to the user, but as an error
     *
     * @param {string} message to display
     * @param {function} [callback] - callback to invoke upon showing async
     */
    modalError: function(message, callback) {
        this.modal.show(this._loadingPartial({
            message: message,
        }, callback).addClass("error"));
    },

    /**
     * Hides the modal
     */
    hideModal: function() {
        this.modal.hide();
    },


    // Fullscreen

    /**
     * Makes the GUI, which is all the DOM stuff for the Viseur, go fulscreen
     */
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

    /**
     * Makes the GUI exit fullscreen
     */
    exitFullscreen: function() {
        this.$element.removeClass("fullscreen");

        $.exitFullscreen();

        var self = this;

        setTimeout(function() { // HACK: width and height will be incorrect after going out of fullscreen, so wait a moment
            self.resize();
        }, 0);

        this._isFullscreen = false;
    },

    /**
     * Checks if the GUI is fullscreened
     *
     * @returns {boolean} true if fullscreened, false otherwise
     */
    isFullscreen: function() {
        return Boolean(this._isFullscreen);
    },
});

module.exports = GUI;
