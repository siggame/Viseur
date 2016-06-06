require("./tabular.scss");

var $ = require("jquery");
var Classe = require("classe");
var partial = require("../partial");
var BaseElement = require("./baseElement");

/**
 * @class Tabular - a block of content accessed via Tabs
 */
var Tabular = Classe(BaseElement, {
    init: function(args) {
        BaseElement.init.apply(this, arguments);

        this.$tabs = $(".tabular-tabs", this.$element);
        this.$contents = $(".tabular-content", this.$element);

        // setup tabs
        this.tabs = [];
        for(var i = 0; i < args.tabs.length; i++) {
            var tab = $.extend({}, args.tabs[i]);
            tab.$tab = this._tabPartial(tab);
            tab.$content = this._tabContentPartial(tab);

            if(tab.content && BaseElement.isInstance(tab.content)) {
                tab.$content.append(tab.content.$element);
            }

            this.$tabs.append(tab.$tab);
            this.$contents.append(tab.$content);
            this.tabs.push(tab);

            (function(tab, self) {
                tab.$tab.on("click", function() {
                    self.setTab(tab);
                });
            })(tab, this);
        }

        this.setTab(this.tabs[0]);
    },

    /**
     * Selects a tab as the active tab, based on title
     *
     * @param {Object|string} the tab, or the the title of the tab to select
     */
    setTab: function(activeTab) {
        if(this._fading) {
            return; // can't set whie doing a fade animation
        }

        if(typeof(activeTab) === "string") {
            activeTab = this._findTab(activeTab);
        }

        if(!this.activeTab) {
            activeTab.$content.addClass("active");
        }

        if(activeTab === this.activeTab) {
            return; // as it's already the active tab
        }

        this.activeTab = activeTab;
        activeTab.active = true;

        for(var i = 0; i < this.tabs.length; i++) {
            var tab = this.tabs[i];
            var wasActive = tab !== activeTab && tab.active;
            if(wasActive) {
                tab.active = false;
            }

            tab.$tab.toggleClass("active", tab === activeTab);

            if(tab !== activeTab) {
                if(wasActive) { // fade it out, then fade in the active tab
                    this._fadeTab(tab);
                }
                else {
                    tab.$content
                        .removeClass("active opaque")
                        .addClass("hidden");
                }
            }
        }
    },

    _fadeTab: function(tab) {
        this._fading = true;
        var self = this;
        tab.$content.removeClass("active").onceTransitionEnds(function() {
            tab.$content.addClass("hidden");

            self.activeTab.$content
                .removeClass("hidden");
                setTimeout(function() {
                    self.activeTab.$content.addClass("active");
                    self._fading = false;
                }, 1);
                //.addClass("active");
        });
    },

    /**
     * Finds a tab based on title
     *
     * @param {string} the title of the tab to find
     * @returns {Object} the tab with title, undefined if not found
     */
    _findTab: function(title) {
        for(var i = 0; i < this.tabs.length; i++) {
            var tab = this.tabs[i];
            if(tab.title.toLowerCase() === title.toLowerCase()) {
                return tab;
            }
        }
    },

    _template: require("./tabular.hbs"),
    _tabPartial: partial(require("./tab.hbs")),
    _tabContentPartial: partial(require("./tabConent.hbs")),
});

module.exports = Tabular;
