require("./tabular.scss");

var $ = require("jquery");
var Classe = require("classe");
var partial = require("../partial");
var Observable = require("core/observable");
var BaseElement = require("./baseElement");

/**
 * @class Tabular - a block of content accessed via Tabs
 */
var Tabular = Classe(Observable, BaseElement, {
    init: function(args) {
        Observable.init.call(this);
        BaseElement.init.apply(this, arguments);

        this.$tabs = $(".tabular-tabs", this.$element);
        this.$contents = $(".tabular-content", this.$element);

        if(args.tabs) {
            this.attachTabs(args.tabs);
        }
    },

    /**
     * Attaches tabs to this tabular
     *
     * @param {Array<BaseElement>} tabs - list of tabs to attach, only call once
     */
    attachTabs: function(tabs) {
        // setup tabs
        this.tabs = [];
        for(var i = 0; i < tabs.length; i++) {
            var tab = $.extend({}, tabs[i]);
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
     * @param {Object|string} activeTab - the tab, or the the title of the tab to select
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

        var previousActiveTab = this.activeTab;
        this.activeTab = activeTab;

        for(var i = 0; i < this.tabs.length; i++) {
            var tab = this.tabs[i];

            tab.$tab.toggleClass("active", tab === activeTab);

            if(tab !== activeTab) {
                if(tab === previousActiveTab) { // fade it out, then fade in the active tab
                    this._fadeTab(tab);
                }
                else {
                    tab.$content
                        .removeClass("active opaque")
                        .addClass("hidden");
                }
            }
        }

        if(activeTab !== previousActiveTab) {
            this._emit("tab-changed", activeTab, previousActiveTab);
        }
    },

    /**
     * Fades a tab out, invoked when switching tabs
     *
     * @param {BaseTab} tab - the tab to fade out
     */
    _fadeTab: function(tab) {
        this._fading = true;
        var self = this;
        tab.$content.removeClass("active").onceTransitionEnds(function() {
            tab.$content.addClass("hidden");

            self.activeTab.$content.removeClass("hidden");

            setTimeout(function() { // HACK: to get the fading between tabs to work
                self.activeTab.$content.addClass("active");
                self._fading = false;
            }, 1);
        });
    },

    /**
     * Finds a tab based on title
     *
     * @param {string} title - the title of the tab to find
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
