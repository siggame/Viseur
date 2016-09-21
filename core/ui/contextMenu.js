require("./contextMenu.scss");

var $ = require("jquery");
var Classe = require("classe");
var BaseElement = require("./baseElement");
var partial = require("../partial");

/**
 * @class ContextMenu - a custom right click menu
 */
var ContextMenu = Classe(BaseElement, {
    init: function(args) {
        BaseElement.init.apply(this, arguments);

        this.hide();

        if(args.structure) {
            this.setStructure(args.structure);
        }

        var self = this;
        this.$element.on("click", function(e) {
            if(!self.$element.hasClass("collapsed")) {
                e.stopPropagation();
            }
        });

        this._offHide = function() {
            self.hide();
        };
    },

    _template: require("./contextMenu.hbs"),
    _itemPartial: partial(require("./contextMenuItem.hbs")),

    /**
     * Sets, and rebuilds, the structure of this context menu
     *
     * @param {Array} structure - array of the structure, in order. Can be object for items, or "---" for seperators
     */
    setStructure: function(structure) {
        this.$element.html("");

        for(var i = 0; i < structure.length; i++) {
            var item = structure[i];

            if(item === "---") {
                this.$element.append($("<hr>"));
            }
            else { // it's a menu item
                var $item = this._itemPartial(item, this.$element);

                (function($item, item, self) {
                    $item.on("click", function(e) {
                        e.stopPropagation();
                        item.callback();
                        self.hide();
                    });
                })($item, item, this);
            }
        }
    },

    show: function(x, y) {
        this.$element
            .css("left", x)
            .css("top", y)
            .removeClass("collapsed");

        var self = this;
        $(document).on("click", self._offHide);
    },

    hide: function() {
        this.$element.addClass("collapsed");
        $(document).off("click", self._offHide);
    },
});

module.exports = ContextMenu;
