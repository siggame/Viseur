require("./infoPane.scss");

var $ = require("jquery");
var Classe = require("classe");
var BaseElement = require("core/ui/baseElement");
var Observable = require("core/observable");
var SettingsManager = require("./settingsManager");
var inputs = require("core/ui/inputs");
var Tabular = require("core/ui/tabular");
var tabs = require("./tabs/");
var $document = $(document); // cache it

/**
 * @class InfoPane - The dockable pane that has tabs and info about the Visualizer
 */
var InfoPane = Classe(BaseElement, Observable, {
    init: function(args) {
        Observable.init.apply(this);
        BaseElement.init.apply(this, arguments);

        this.gui = args.gui;

        this.$resizer = this.$element.find(".info-pane-resizer");
        this.$content = this.$element.find(".info-pane-content");

        this.snapTo(SettingsManager.get("viseur", "info-pane-side", "right"));
        this.resize(SettingsManager.get("viseur", "info-pane-length", 420));

        var self = this;
        this.$resizer.on("mousedown", function(downEvent) {
            self._onResize(downEvent);
        });

        SettingsManager.on("viseur.info-pane-side.changed", function(newValue) {
            self.snapTo(newValue);
        });

        this.tabular = new Tabular({
            id: "info-pane-tabular",
            $parent: this.$content,
        });

        var tabularTabs = [];
        for(var i = 0; i < tabs.length; i++) {
            var tab = tabs[i];
            tabularTabs.push({
                title: tab.title,
                content: this._initTab(tab),
            });
        }

        this.tabular.attachTabs(tabularTabs);
    },

    _template: require("./infoPane.hbs"),
    _minLength: 200, // in pixels

    /**
     * Initializes a tab, from some tab data in ./tabs/
     *
     * @param {Object} tabData - data on what the tab is, see examples in ./tabs/
     * @returns {*} the constructed tab classe as per defined in `tabData`
     */
    _initTab: function(tabData) {
        var newTab = new tabData.classe({
            id: tabData.title + "-tab",
            tabular: this.tabular,
        });

        if(tabData.title === "Inspect") {
            var self = this;
            newTab.on("highlighted", function() {
                self.tabular.setTab(tabData.title);
            });
        }

        return newTab;
    },

    /**
     * Resizes the info pane based on position and length
     *
     * @param {number} [newLength] - the new length (in pixels) of this info pane. If omitted the old length is used. cannot be less than _minLength
     */
    resize: function(newLength) {
        this.$element.addClass("resizing");
        if(newLength) {
            this._length = Math.max(newLength, this._minLength);
            SettingsManager.set("viseur", "info-pane-length", this._length);
        }

        if(this.orientation === "horizontal") {
            this.$element
                .height(this._length)
                .css("width", "");
        }
        else {
            this.$element
                .width(this._length)
                .css("height", "");
        }

        var width = this.$element.width();
        var height = this.$element.height();

        if(this.gui.isFullscreen()) {
            width = 0;
            height = 0;
        }

        this._emit("resized", width, height);
        this.$element.removeClass("resizing");
    },

    _sides: ["top", "left", "bottom", "right"], // all possible sides

    /**
     * Snaps to a new side of the screen
     *
     * @param {string} side - the side to snap to, must be 'top', 'left', 'bottom', or 'right'
     */
    snapTo: function(side) {
        side = side.toLowerCase();
        if(!this._sides.contains(side)) {
            throw new Error("invalid side to snap to: '{}'.".format(side));
        }

        for(var i = 0; i < this._sides.length; i++) {
            var possibleSide = this._sides[i];
            this.$element.toggleClass("snap-" + possibleSide, possibleSide === side);
        }

        if(side === "top" || side === "left") {
            this.$content.after(this.$resizer);
        }
        else {
            this.$content.before(this.$resizer);
        }

        this.side = side;
        this.orientation = (side === "left" || side === "right") ? "vertical" : "horizontal";

        this.resize();
    },

    /**
     * Invoked when the user is dragging to resize this
     *
     * @private
     * @param {PIXI.Event} downEvent - the event geenated from dragging the info pane
     */
    _onResize: function(downEvent) {
        var x = downEvent.pageX;
        var y = downEvent.pageY;
        var width = this.$element.width();
        var height = this.$element.height();

        var self = this;
        $document // cached at the top of this file
            .on("mousemove", function(moveEvent) {
                self._emit("resize-start");
                var oldX = x;
                var oldY = y;

                x = moveEvent.pageX;
                y = moveEvent.pageY;

                self.$element.addClass("resizing");
                if(self.orientation === "horizontal") {
                    var dy = oldY - y;
                    if(self.side === "top") {
                        dy = -dy;
                    }

                    if(dy !== 0) {
                        height += dy;
                        self.resize(height);
                    }
                }
                else {
                    var dx = oldX - x;
                    if(self.side === "left") {
                        dx = -dx;
                    }

                    if(dx !== 0) {
                        width += dx;
                        self.resize(width);
                    }
                }
            })
            .on("mouseup", function() {
                self.$element.removeClass("resizing");
                self._emit("resize-end");
                $document.off("mousemove mouseup");
            });
    },
});

module.exports = InfoPane;
