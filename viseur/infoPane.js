require("./infoPane.scss");

var $ = require("jquery");
var Classe = require("classe");
var BaseElement = require("core/ui/baseElement");
var Observable = require("core/observable");
var SettingsManager = require("./settingsManager");
var inputs = require("core/ui/inputs");
var Tabular = require("core/ui/tabular");
var tabs = require("./tabs/");
var $document = $(document);

/**
 * @class InfoPane - The dockable pane that has tabs and info about the Visualizer
 */
var InfoPane = Classe(BaseElement, Observable, {
    init: function() {
        Observable.init.apply(this);
        BaseElement.init.apply(this, arguments);

        this._length = 400;
        this.snapTo(SettingsManager.get("info-pane-orientation", "right"));
        this.resize(SettingsManager.get("info-pane-length", this._length));

        var self = this;
        this.$resizer = this.$element.find(".info-pane-resizer").on("mousedown", function(downEvent) {
            self._onResize(downEvent);
        });

        var tabularTabs = [];
        for(var i = 0; i < tabs.length; i++) {
            var tab = tabs[i];
            tabularTabs.push({
                title: tab.title,
                content: new tab.classe({id: tab.title + "-tab"}),
            });
        }

        this.$content = this.$element.find(".info-pane-content");
        this.tabular = new Tabular({
            id: "info-pane-tabular",
            $parent: this.$content,
            tabs: tabularTabs,
        });
    },

    _template: require("./infoPane.hbs"),

    resize: function(newLength) {
        if(newLength) {
            this._length = newLength;
            SettingsManager.set("info-pane-length", newLength);
        }

        if(this.orientation === "horizontal") {
            this.$element.height(this._length);
        }
        else {
            this.$element.width(this._length);
        }

        this._emit("resized", this.$element.width(), this.$element.height());
    },

    _sides: ["top", "left", "bottom", "right"],
    snapTo: function(side) {
        side = side.toLowerCase();
        if(!this._sides.contains(side)) {
            throw new Error("invalid side to snap to: '{}'.".format(side));
        }

        SettingsManager.set("info-pane-side", side);

        for(var i = 0; i < this._sides.length; i++) {
            var possibleSide = this._sides[i];
            this.$element.toggleClass("snap-" + possibleSide, possibleSide === side);
        }

        this.side = side;
        this.orientation = side === "left" || side === "right" ? "vertical" : "horizontal";

        this.resize();
    },

    _onResize: function(downEvent) {
        var x = downEvent.pageX;
        var y = downEvent.pageY;
        var width = this.$element.width();
        var height = this.$element.height();

        var self = this;
        $document
            .on("mousemove", function(moveEvent) {
                var oldX = x;
                var oldY = y;

                x = moveEvent.pageX;
                y = moveEvent.pageY;

                self.$element.addClass("resizing");
                if(self.orientation === "horizontal") {
                    var dy = oldY - y;
                    if(dy !== 0) {
                        height += dy
                        self.resize(height);
                    }
                }
                else {
                    var dx = oldX - x;
                    if(dx !== 0) {
                        width += dx;
                        self.resize(width);
                    }
                }
            })
            .on("mouseup", function() {
                self.$element.removeClass("resizing");
                $document.off("mousemove mouseup");
            });
    },
});

module.exports = InfoPane;
